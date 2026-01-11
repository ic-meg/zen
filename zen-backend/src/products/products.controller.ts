import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CloudinaryService } from '../uploads/cloudinary.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // POST /products - Create new product 
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    console.log('Received product data:', createProductDto);
    
    try {
      const product = await this.productsService.create(createProductDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Product created successfully',
        data: product,
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // POST /products/upload-image - Upload product image
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files (JPEG, PNG, WebP) are allowed');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    try {
      const result = await this.cloudinaryService.uploadImage(file);
      return {
        statusCode: HttpStatus.OK,
        message: 'Image uploaded successfully',
        data: {
          imageUrl: result.secure_url,
          publicId: result.public_id,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to upload image');
    }
  }

  // GET /products - Get all products or filter by category
  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    
    const products = category
      ? await this.productsService.findByCategory(category)
      : await this.productsService.findAll();

    return {
      statusCode: HttpStatus.OK,
      message: 'Products retrieved successfully',
      data: products,
    };
  }

  // GET /products/stats - Admin dashboard stats
  @Get('stats')
  async getStats() {
    const stats = await this.productsService.getProductStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Product statistics retrieved successfully',
      data: stats,
    };
  }

  // GET /products/low-stock - Get low stock products
  @Get('low-stock')
  async getLowStock(@Query('threshold') threshold?: string) {
    const thresholdValue = threshold ? parseInt(threshold) : 10;
    const products = await this.productsService.getLowStockProducts(thresholdValue);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Low stock products retrieved successfully',
      data: products,
    };
  }

  // GET /products/:id - Get single product
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  // PATCH /products/:id - Update product (Admin only)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsService.update(id, updateProductDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Product updated successfully',
      data: product,
    };
  }

  // DELETE /products/:id - Delete product (Admin only)
  @Delete(':id')
  async remove(@Param('id') id: string, @Query('force') force?: string) {
    console.log('Delete request received for product ID:', id, 'Force:', force);
    
    try {
      const forceDelete = force === 'true';
      const result = await this.productsService.remove(id, forceDelete);
      return {
        statusCode: HttpStatus.OK,
        ...result,
      };
    } catch (error) {
      console.error('Controller delete error:', error);
      throw error;
    }
  }

  // PATCH /products/:id/stock - Update stock quantity
  @Patch(':id/stock')
  async updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    const product = await this.productsService.updateStock(id, quantity);
    return {
      statusCode: HttpStatus.OK,
      message: 'Stock updated successfully',
      data: product,
    };
  }
}