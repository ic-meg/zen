import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}


  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      return await this.prisma.product.create({
        data: {
          title: createProductDto.title,
          subtitle: createProductDto.subtitle,
          description: createProductDto.description,
          price: createProductDto.price,
          stock: createProductDto.stock,
          category: createProductDto.category,
          image: createProductDto.image,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create product');
    }
  }

  async findAll(): Promise<Product[]> {
    return await this.prisma.product.findMany({
      orderBy: {
        createdAt: 'desc', 
      },
    });
  }

  async findByCategory(category: string): Promise<Product[]> {
    return await this.prisma.product.findMany({
      where: {
        category: {
          contains: category,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    // Check if product exists
    const existingProduct = await this.findOne(id);

    try {
      return await this.prisma.product.update({
        where: { id },
        data: {
          ...updateProductDto,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to update product');
    }
  }

  async remove(id: string, force: boolean = false): Promise<{ message: string }> {
    
    // Check if product exists
    await this.findOne(id);

    // Check if product is in use
    const productInUse = await this.checkProductInUse(id);
    
    if (productInUse.inOrders && !force) {
      const errorMessage = `Cannot delete product. It's currently in orders. Use force delete to mark it as inactive instead of deleting.`;
      throw new BadRequestException(errorMessage);
    }

    if (productInUse.inCart && !force) {
      const errorMessage = `Cannot delete product. It's currently in carts. Use force delete to remove it anyway.`;
      throw new BadRequestException(errorMessage);
    }

    try {
      // If product is in orders, we can't actually delete it kasi foreign key
      // Instead, we'll mark it as inactive or handle it differently
      if (force && productInUse.inOrders) {
        
        // Remove from carts if present
        if (productInUse.inCart) {
          await this.prisma.cartItem.deleteMany({
            where: { productId: id },
          });
        }
        
        // Instead of deleting, we'll update the product to mark it as deleted/inactive
        await this.prisma.product.update({
          where: { id },
          data: {
            title: `[DELETED] ${(await this.findOne(id)).title}`,
            stock: 0,
          },
        });

        return { message: 'Product marked as deleted successfully (preserved for order history)' };
      }
      
      // If force delete and only in carts (not orders), remove from carts first
      if (force && productInUse.inCart && !productInUse.inOrders) {
        await this.prisma.cartItem.deleteMany({
          where: { productId: id },
        });
      }
      
      // Now try to delete the product
      await this.prisma.product.delete({
        where: { id },
      });

      return { message: 'Product deleted successfully' };
    } catch (error) {
      console.error('Delete error:', error);
      
      // Check if it's a foreign key constraint error
      if (error.code === 'P2003') {
        throw new BadRequestException('Cannot delete product due to existing order references. Product has been marked as inactive instead.');
      }
      
      throw new BadRequestException('Failed to delete product');
    }
  }

//---------------------- STOCK 
  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);

    if (product.stock < quantity) {
      throw new BadRequestException(`Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`);
    }

    return await this.prisma.product.update({
      where: { id },
      data: {
        stock: product.stock - quantity,
      },
    });
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    return await this.prisma.product.findMany({
      where: {
        stock: {
          lte: threshold,
        },
      },
      orderBy: {
        stock: 'asc', // Show lowest stock first
      },
    });
  }
//------------------------ CARt
  // Check if product is being used in carts or orders
  private async checkProductInUse(productId: string): Promise<{ inCart: boolean; inOrders: boolean }> {
    const [cartItems, orderItems] = await Promise.all([
      this.prisma.cartItem.findFirst({
        where: { productId },
      }),
      this.prisma.orderItem.findFirst({
        where: { productId },
      }),
    ]);

    return {
      inCart: !!cartItems,
      inOrders: !!orderItems,
    };
  }

  // Validate stock before adding to cart
  async validateStock(productId: string, requestedQuantity: number): Promise<boolean> {
    const product = await this.findOne(productId);
    return product.stock >= requestedQuantity;
  }

  // Get product statistics for admin dashboard
  async getProductStats(): Promise<{
    totalProducts: number;
    totalStock: number;
    lowStockCount: number;
    categoryCounts: Record<string, number>;
  }> {
    const [totalProducts, products, lowStockProducts] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.findMany({
        select: {
          stock: true,
          category: true,
        },
      }),
      this.getLowStockProducts(),
    ]);

    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const categoryCounts = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProducts,
      totalStock,
      lowStockCount: lowStockProducts.length,
      categoryCounts,
    };
  }
}