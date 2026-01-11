import { Controller, Get, Post, Body, Headers, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
import type { PayMongoWebhookPayload, WebhookHeaders } from './dto/paymongo-webhook.dto';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
  ) {}

  @Get('paymongo')
  @HttpCode(HttpStatus.OK)
  async testWebhook() {
    this.logger.log('=== WEBHOOK GET TEST CALLED ===');
    return { 
      message: 'PayMongo Webhook endpoint is working', 
      timestamp: new Date().toISOString(),
      pendingOrders: this.ordersService.getPendingOrdersCount()
    };
  }

  @Post('paymongo')
  @HttpCode(HttpStatus.OK)
  async handlePayMongoWebhook(
    @Body() payload: any, // Changed to any to catch all webhook formats
    @Headers() headers: any,
  ) {
    try {
      this.logger.log('=== WEBHOOK RECEIVED ===');
      this.logger.log('Full payload structure:', JSON.stringify(payload, null, 2));
      this.logger.log('Headers:', JSON.stringify(headers, null, 2));
      
      // Handle different possible PayMongo webhook formats
      let eventType: string | null = null;
      let eventData: any = null;

      // Check for direct event format
      if (payload?.data?.type) {
        eventType = payload.data.type;
        eventData = payload.data.attributes;
        this.logger.log(`Direct event format - Type: ${eventType}`);
      }
      // Check for nested event format
      else if (payload?.data?.attributes?.type) {
        eventType = payload.data.attributes.type;
        eventData = payload.data.attributes.data;
        this.logger.log(`Nested event format - Type: ${eventType}`);
      }
      // Check for other formats
      else if (payload?.type) {
        eventType = payload.type;
        eventData = payload.data || payload.attributes;
        this.logger.log(`Simple event format - Type: ${eventType}`);
      }

      if (!eventType) {
        this.logger.warn('Could not determine event type from payload');
        return { success: true, message: 'Event type unknown but webhook received' };
      }

      this.logger.log(`Processing event: ${eventType}`);
      
      if (eventType.includes('checkout_session')) {
        this.logger.log('=== CHECKOUT SESSION EVENT DETECTED ===');
        await this.handleCheckoutSessionCompleted(eventData || payload);
      } 
      else if (eventType.includes('payment')) {
        this.logger.log('=== PAYMENT EVENT DETECTED ===');
        if (eventType.includes('paid') || eventType.includes('successful')) {
          await this.handlePaymentPaid(eventData || payload);
        }
      }
      else {
        this.logger.log(`=== UNHANDLED EVENT: ${eventType} ===`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error('=== WEBHOOK ERROR ===', error.stack);
      return { success: false, error: error.message };
    }
  }

  private async handlePaymentPaid(eventData: any) {
    this.logger.log('Payment paid event received', eventData);

    const checkoutSessionId = eventData.checkout_session_id || eventData.id;
    if (!checkoutSessionId) {
      this.logger.error('No checkout session ID found in payment.paid event');
      return;
    }

    try {
      const order = await this.ordersService.completePaymongoOrder(checkoutSessionId, eventData);
      this.logger.log('Order created from payment.paid webhook', { orderId: order.id });

      // Also handle the payment record
      await this.paymentsService.handleSuccessfulPayment({
        checkoutSessionId,
        amount: eventData.amount,
        currency: eventData.currency,
        paymentMethod: eventData.payment_method || 'PayMongo',
        webhookData: eventData
      });
    } catch (error) {
      this.logger.error('Error processing payment.paid webhook', error);
    }
  }

  private async handlePaymentFailed(eventData: any) {
    const checkoutSessionId = eventData.checkout_session_id;
    const failureReason = eventData.failure_reason || 'Payment failed';

    await this.paymentsService.handleFailedPayment({
      checkoutSessionId,
      failureReason,
      webhookData: eventData
    });
  }

  private async handleCheckoutSessionCompleted(eventData: any) {
    this.logger.log('=== HANDLING CHECKOUT SESSION COMPLETED ===');
    this.logger.log('Event data structure:', JSON.stringify(eventData, null, 2));
    
    let checkoutSessionId = null;
    
    if (eventData.id) {
      checkoutSessionId = eventData.id;
      this.logger.log(`Found session ID directly: ${checkoutSessionId}`);
    }
    else if (eventData.data?.id) {
      checkoutSessionId = eventData.data.id;
      this.logger.log(`Found session ID in data: ${checkoutSessionId}`);
    }
    else if (eventData.attributes?.id) {
      checkoutSessionId = eventData.attributes.id;
      this.logger.log(`Found session ID in attributes: ${checkoutSessionId}`);
    }
    // Data attributes
    else if (eventData.data?.attributes?.id) {
      checkoutSessionId = eventData.data.attributes.id;
      this.logger.log(`Found session ID in data.attributes: ${checkoutSessionId}`);
    }

    if (!checkoutSessionId) {
      this.logger.error('=== NO CHECKOUT SESSION ID FOUND ===');
      this.logger.error('Available keys in eventData:', Object.keys(eventData));
      return { success: false, error: 'No checkout session ID found' };
    }

    this.logger.log(`=== ATTEMPTING TO COMPLETE ORDER FOR SESSION: ${checkoutSessionId} ===`);

    try {
      const order = await this.ordersService.completePaymongoOrder(checkoutSessionId, eventData);
      this.logger.log('=== ORDER CREATED SUCCESSFULLY ===', { 
        orderId: order.id,
        sessionId: checkoutSessionId 
      });
      return { success: true, orderId: order.id };
    } catch (error) {
      this.logger.error('=== ERROR CREATING ORDER ===');
      this.logger.error('Error details:', error.message);
      this.logger.error('Stack trace:', error.stack);
      throw error;
    }
  }

  private verifySignature(payload: any, signature: string): boolean {
    return true;
  }
}