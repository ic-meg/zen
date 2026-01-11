import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Get user's cart
  @Get(':userId')
  async getCart(@Param('userId') userId: string) {
    return this.cartService.getOrCreateCart(userId);
  }

  // Add item to cart
  @Post(':userId/items')
  async addItem(
    @Param('userId') userId: string,
    @Body() body: { productId: string; quantity?: number },
  ) {
    const { productId, quantity = 1 } = body;
    return this.cartService.addItem(userId, productId, quantity);
  }

  // Update item quantity
  @Put(':userId/items/:productId')
  async updateItemQuantity(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Body() body: { quantity: number },
  ) {
    const { quantity } = body;
    return this.cartService.updateItemQuantity(userId, productId, quantity);
  }

  // Remove item from cart
  @Delete(':userId/items/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    await this.cartService.removeItem(userId, productId);
  }

  // Clear entire cart
  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@Param('userId') userId: string) {
    await this.cartService.clearCart(userId);
  }

  // Get cart totals
  @Get(':userId/total')
  async getCartTotal(@Param('userId') userId: string) {
    return this.cartService.getCartTotal(userId);
  }
}