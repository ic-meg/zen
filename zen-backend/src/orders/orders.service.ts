import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { PaymongoService } from '../payments/paymongo.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export interface CreateOrderDto {
  userId?: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
  addressStreet: string;
  addressRegion: string;
  addressProvince?: string;
  addressCity: string;
  addressBarangay: string;
  addressZipCode: string;
  paymentMethod?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface CreateCheckoutSessionDto {
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    region: string;
    province?: string;
    city: string;
    barangay: string;
    zipCode: string;
  };
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    amount: number;
    currency: string;
    description?: string;
  }>;
  amount: number;
  currency: string;
  description: string;
  success_url?: string;
  cancel_url?: string;
  subtotal?: number;
  shipping?: number;
  total?: number;
  paymentMethod: 'COD' | 'paymongo';
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private productsService: ProductsService,
    private paymongoService: PaymongoService,
  ) {}

  async createCheckoutSession(createCheckoutSessionDto: CreateCheckoutSessionDto) {
    const { customerInfo, shippingAddress, items, paymentMethod } = createCheckoutSessionDto;

    if (paymentMethod === 'COD') {
      // Handle Cash on Delivery
      const orderData = {
        customerEmail: customerInfo.email,
        customerFirstName: customerInfo.firstName,
        customerLastName: customerInfo.lastName,
        customerPhone: customerInfo.phone,
        addressStreet: shippingAddress.street,
        addressRegion: shippingAddress.region,
        addressProvince: shippingAddress.province,
        addressCity: shippingAddress.city,
        addressBarangay: shippingAddress.barangay,
        addressZipCode: shippingAddress.zipCode,
        paymentMethod: 'COD'
      };

      // Create order directly for COD
      const order = await this.createOrder(orderData, items);
      
      return {
        type: 'COD',
        order: order,
        message: 'Cash on Delivery order created successfully'
      };

    } else {
      // Handle PayMongo payment
      if (!createCheckoutSessionDto.success_url || !createCheckoutSessionDto.cancel_url) {
        throw new BadRequestException('success_url and cancel_url are required for PayMongo payments');
      }

      const paymongoData = {
        amount: createCheckoutSessionDto.amount,
        currency: createCheckoutSessionDto.currency,
        description: createCheckoutSessionDto.description,
        line_items: items,
        success_url: createCheckoutSessionDto.success_url,
        cancel_url: createCheckoutSessionDto.cancel_url,
        billing: {
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          email: customerInfo.email,
          phone: customerInfo.phone
        }
      };

      const checkoutSession = await this.paymongoService.createCheckoutSession(paymongoData);
      
      // Store pending order data for later completion
      const pendingOrderData = {
        checkoutSessionId: checkoutSession.id,
        customerInfo,
        shippingAddress,
        items,
        amount: createCheckoutSessionDto.amount,
        paymentMethod: 'PAYMONGO'
      };

      // Store pending order data in memory or database
      this.storePendingOrder(checkoutSession.id, pendingOrderData);
      
      return {
        type: 'paymongo',
        checkoutSession: checkoutSession,
        pendingOrderData: pendingOrderData
      };
    }
  }

  private pendingOrders = new Map<string, any>();

 
  public getPendingOrdersCount(): number {
    return this.pendingOrders.size;
  }

  private storePendingOrder(checkoutSessionId: string, orderData: any) {
    // console.log('=== STORING PENDING ORDER ===');
    // console.log('Checkout Session ID:', checkoutSessionId);
    // console.log('Order Data:', JSON.stringify(orderData, null, 2));
    this.pendingOrders.set(checkoutSessionId, orderData);
    console.log('Total pending orders:', this.pendingOrders.size);
  }

  private getPendingOrder(checkoutSessionId: string) {
    return this.pendingOrders.get(checkoutSessionId);
  }

  private removePendingOrder(checkoutSessionId: string) {
    this.pendingOrders.delete(checkoutSessionId);
  }

  // Complete PayMongo order when webhook is received
  async completePaymongoOrder(checkoutSessionId: string, paymentData: any) {
    // console.log('=== COMPLETING PAYMONGO ORDER ===');
    // console.log('Checkout Session ID:', checkoutSessionId);
    
    const pendingOrderData = this.getPendingOrder(checkoutSessionId);
    if (!pendingOrderData) {
      throw new BadRequestException(`No pending order found for checkout session: ${checkoutSessionId}`);
    }

    // console.log('Found pending order data:', pendingOrderData);

    // Create the order using the stored pending data
    const orderData = {
      customerEmail: pendingOrderData.customerInfo.email,
      customerFirstName: pendingOrderData.customerInfo.firstName,
      customerLastName: pendingOrderData.customerInfo.lastName,
      customerPhone: pendingOrderData.customerInfo.phone,
      addressStreet: pendingOrderData.shippingAddress.street,
      addressRegion: pendingOrderData.shippingAddress.region,
      addressProvince: pendingOrderData.shippingAddress.province,
      addressCity: pendingOrderData.shippingAddress.city,
      addressBarangay: pendingOrderData.shippingAddress.barangay,
      addressZipCode: pendingOrderData.shippingAddress.zipCode,
      paymentMethod: 'PAYMONGO',
      paymentId: paymentData?.id || checkoutSessionId
    };

    // console.log('Creating order with data:', orderData);

    // Create the order
    const order = await this.createOrder(orderData, pendingOrderData.items);

    this.removePendingOrder(checkoutSessionId);

    // console.log('PayMongo order created successfully:', order.id);
    return order;
  }

  async createOrder(orderData: any, items: any[]) {
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.amount * item.quantity / 100), 0);
    const shipping = 50.00;
    const total = subtotal + shipping;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Validate that all products exist and have sufficient stock
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId }
      });
      
      if (!product) {
        throw new BadRequestException(`Product with ID ${item.productId} not found`);
      }
      
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }
    }

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerEmail: orderData.customerEmail,
        customerFirstName: orderData.customerFirstName,
        customerLastName: orderData.customerLastName,
        customerPhone: orderData.customerPhone,
        addressStreet: orderData.addressStreet,
        addressRegion: orderData.addressRegion,
        addressProvince: orderData.addressProvince,
        addressCity: orderData.addressCity,
        addressBarangay: orderData.addressBarangay,
        addressZipCode: orderData.addressZipCode,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        status: orderData.paymentMethod === 'COD' ? OrderStatus.PENDING : OrderStatus.PROCESSING,
        paymentStatus: orderData.paymentMethod === 'COD' ? PaymentStatus.PENDING : PaymentStatus.COMPLETED,
        paymentMethod: orderData.paymentMethod,
        orderItems: {
          create: items.map(item => ({
            productId: item.productId,
            title: item.name,
            subtitle: item.description || '',
            quantity: item.quantity,
            price: item.amount / 100,
            subtotal: (item.amount * item.quantity) / 100,
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    // Reduce product stock for COD orders (for PayMongo, this will be done after payment confirmation)
    if (orderData.paymentMethod === 'COD') {
      for (const item of items) {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }
    }

    return order;
  }


  async createFromCart(userId: string, createOrderDto: CreateOrderDto) {
    const cart = await this.cartService.getOrCreateCart(userId);
    
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Check for duplicate pending orders in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentOrder = await this.prisma.order.findFirst({
      where: {
        userId,
        status: {
          in: [OrderStatus.PENDING, OrderStatus.PROCESSING]
        },
        createdAt: {
          gte: fiveMinutesAgo
        },
        total: cart.subtotal + 50.00 // same total as current cart
      }
    });

    if (recentOrder) {
      throw new BadRequestException('You already have a recent pending order. Please wait before creating another order or complete your existing order.');
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (!await this.productsService.validateStock(item.productId, item.quantity)) {
        throw new BadRequestException(`Insufficient stock for ${item.product.title}`);
      }
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber();
    
    // Calculate totals
    const subtotal = cart.subtotal;
    const shipping = 50.00;
    const total = subtotal + shipping;

    // Prepare order items data for batch creation
    const orderItemsData = cart.items.map(item => ({
      productId: item.productId,
      title: item.product.title,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    }));

    // Create order in optimized transaction with increased timeout
    const order = await this.prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: createOrderDto.userId || userId,
          orderNumber,
          customerEmail: createOrderDto.customerEmail,
          customerFirstName: createOrderDto.customerFirstName,
          customerLastName: createOrderDto.customerLastName,
          customerPhone: createOrderDto.customerPhone,
          addressStreet: createOrderDto.addressStreet,
          addressRegion: createOrderDto.addressRegion,
          addressProvince: createOrderDto.addressProvince,
          addressCity: createOrderDto.addressCity,
          addressBarangay: createOrderDto.addressBarangay,
          addressZipCode: createOrderDto.addressZipCode,
          subtotal,
          shipping,
          total,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      const orderItemsToCreate = orderItemsData.map(item => ({
        orderId: newOrder.id,
        ...item,
      }));

      await tx.orderItem.createMany({
        data: orderItemsToCreate,
      });

      return newOrder;
    }, {
      timeout: 10000, 
    });

    for (const item of cart.items) {
      await this.productsService.updateStock(item.productId, item.quantity);
    }

    await this.cartService.clearCart(userId);

    return this.findOne(order.id);
  }

  // Get all orders (admin)
  async findAll(page: number = 1, limit: number = 10, status?: OrderStatus) {
    const skip = (page - 1) * limit;
    
    const where = status ? { status } : {};
    
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  subtitle: true,
                  image: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map(order => this.formatOrderResponse(order)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get orders by user
  async findByUser(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                subtitle: true,
                image: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map(order => this.formatOrderResponse(order));
  }

  // Get single order
  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                subtitle: true,
                image: true,
                category: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.formatOrderResponse(order);
  }

  // Update order status
  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto) {
    await this.findOne(id);

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
      },
    });

    return this.findOne(updatedOrder.id);
  }

  // Cancel order
  async cancelOrder(id: string) {
    const order = await this.findOne(id);

    // Check if order is already cancelled
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    // Check if order can be cancelled (not shipped or delivered)
    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel shipped or delivered orders');
    }

    // Restore stock for cancelled orders
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
      });

      // Restore product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    });

    return this.findOne(id);
  }

  // Private helper methods
  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const count = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
      },
    });

    const orderNumber = `ORD-${year}${month}${day}-${(count + 1).toString().padStart(4, '0')}`;
    return orderNumber;
  }

  private formatOrderResponse(order: any) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      customer: {
        email: order.customerEmail,
        firstName: order.customerFirstName,
        lastName: order.customerLastName,
        phone: order.customerPhone,
      },
      address: {
        street: order.addressStreet,
        region: order.addressRegion,
        province: order.addressProvince,
        city: order.addressCity,
        barangay: order.addressBarangay,
        zipCode: order.addressZipCode,
      },
      items: order.orderItems?.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
        subtotal: parseFloat(item.subtotal.toString()),
        product: item.product,
      })) || [],
      subtotal: parseFloat(order.subtotal.toString()),
      shipping: parseFloat(order.shipping.toString()),
      total: parseFloat(order.total.toString()),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}