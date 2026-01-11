import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  // Create or get existing cart for user
  async getOrCreateCart(userId: string) {
    // First, ensure user exists or create a temporary user for testing
    await this.ensureUserExists(userId);

    let cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    return this.formatCartResponse(cart);
  }

  // Helper method to ensure user exists (for testing purposes)
  private async ensureUserExists(userId: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      // Create a temporary user for testing
      await this.prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@test.com`,
          firstName: 'Test',
          lastName: 'User',
          role: 'USER'
        }
      });
    }
  }

  // Add item to cart
  async addItem(userId: string, productId: string, quantity: number = 1) {
    // Ensure user exists first
    await this.ensureUserExists(userId);
    
    // Validate product exists and has stock
    const product = await this.productsService.findOne(productId);
    
    if (!await this.productsService.validateStock(productId, quantity)) {
      throw new BadRequestException('Insufficient stock');
    }

    // Get or create cart
    const cart = await this.getOrCreateCartEntity(userId);

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      
      if (!await this.productsService.validateStock(productId, newQuantity)) {
        throw new BadRequestException('Insufficient stock for requested quantity');
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          price: product.price, // Update with current price
        },
      });
    } else {
      // Create new cart item
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          price: product.price,
        },
      });
    }

    return this.getOrCreateCart(userId);
  }

  // Update item quantity
  async updateItemQuantity(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }

    // Validate stock
    if (!await this.productsService.validateStock(productId, quantity)) {
      throw new BadRequestException('Insufficient stock');
    }

    const cart = await this.getOrCreateCartEntity(userId);
    
    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    return this.getOrCreateCart(userId);
  }

  // Remove item from cart
  async removeItem(userId: string, productId: string) {
    const cart = await this.getOrCreateCartEntity(userId);

    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    return this.getOrCreateCart(userId);
  }

  // Clear entire cart
  async clearCart(userId: string) {
    const cart = await this.getOrCreateCartEntity(userId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getOrCreateCart(userId);
  }

  // Get cart total
  async getCartTotal(userId: string): Promise<{ subtotal: number; itemCount: number }> {
    const cart = await this.getOrCreateCart(userId);
    
    const subtotal = cart.items.reduce((total, item) => {
      return total + (parseFloat(item.price.toString()) * item.quantity);
    }, 0);

    const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

    return { subtotal, itemCount };
  }

  // Private helper methods
  private async getOrCreateCartEntity(userId: string) {
    let cart = await this.prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    return cart;
  }

  private formatCartResponse(cart: any) {
    const subtotal = cart.items.reduce((total, item) => {
      return total + (parseFloat(item.price.toString()) * item.quantity);
    }, 0);

    const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
        subtotal: parseFloat(item.price.toString()) * item.quantity,
        product: {
          id: item.product.id,
          title: item.product.title,
          subtitle: item.product.subtitle,
          image: item.product.image,
          stock: item.product.stock,
          category: item.product.category,
        },
      })),
      subtotal,
      itemCount,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}