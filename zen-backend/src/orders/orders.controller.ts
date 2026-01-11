import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ValidationPipe,
  BadRequestException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { OrderStatus } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Create checkout session (for both COD and PayMongo)
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body(ValidationPipe) createCheckoutSessionDto: CreateCheckoutSessionDto,
  ) {
    const result = await this.ordersService.createCheckoutSession(createCheckoutSessionDto);
    return {
      message: 'Checkout session created successfully',
      data: result,
    };
  }

  // Create order from cart
  @Post('from-cart/:userId')
  async createFromCart(
    @Param('userId') userId: string,
    @Body(ValidationPipe) createOrderDto: CreateOrderDto,
  ) {
    const order = await this.ordersService.createFromCart(userId, createOrderDto);
    return {
      message: 'Order created successfully',
      data: order,
    };
  }

  // Get all orders (admin)
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    // Validate status if provided
    if (status && !Object.values(OrderStatus).includes(status as OrderStatus)) {
      throw new BadRequestException(
        `Invalid order status: ${status}. Valid statuses are: ${Object.values(OrderStatus).join(', ')}`
      );
    }

    const validatedStatus = status as OrderStatus | undefined;
    const result = await this.ordersService.findAll(page, limit, validatedStatus);
    return {
      message: 'Orders retrieved successfully',
      data: result.orders,
      pagination: result.pagination,
    };
  }

  // Get orders by user
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    const orders = await this.ordersService.findByUser(userId);
    return {
      message: 'User orders retrieved successfully',
      data: orders,
    };
  }

  // Get single order
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    return {
      message: 'Order retrieved successfully',
      data: order,
    };
  }

  // Update order status
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map(error => {
          if (error.property === 'status') {
            return `Invalid status: ${error.value}. Valid statuses are: ${Object.values(OrderStatus).join(', ')}`;
          }
          return Object.values(error.constraints || {}).join(', ');
        });
        return new BadRequestException(messages.join('; '));
      }
    })) updateStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.ordersService.updateStatus(id, updateStatusDto);
    return {
      message: 'Order status updated successfully',
      data: order,
    };
  }

  // Cancel order
  @Put(':id/cancel')
  async cancelOrder(@Param('id') id: string) {
    const order = await this.ordersService.cancelOrder(id);
    return {
      message: 'Order cancelled successfully',
      data: order,
    };
  }
}