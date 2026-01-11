import { Controller, Get, Post, Body, Headers, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentMethodEnum } from './dto/create-payment.dto';
import type { PayMongoWebhookPayload, WebhookHeaders } from './dto/paymongo-webhook.dto';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('paymongo')
  @HttpCode(HttpStatus.OK)
  async testWebhook() {
    return { 
      message: 'PayMongo Webhook endpoint is working', 
      timestamp: new Date().toISOString() 
    };
  }

  @Post('paymongo')
  @HttpCode(HttpStatus.OK)
  async handlePayMongoWebhook(
    @Body() payload: PayMongoWebhookPayload,
    @Headers() headers: WebhookHeaders,
  ) {
    try {
      this.logger.log('PayMongo webhook received', { 
        type: payload.data.type,
        eventId: payload.data.id 
      });



      const { type, attributes } = payload.data;
      const eventData = attributes.data.attributes;

      switch (type) {
        case 'payment.paid':
          await this.handlePaymentPaid(eventData);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(eventData);
          break;
        case 'checkout_session.payment_successful':
          await this.handleCheckoutSessionCompleted(eventData);
          break;
        default:
          this.logger.warn(`Unhandled webhook event type: ${type}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Webhook processing failed', error.stack);
      return { success: false, error: error.message };
    }
  }

  private async handlePaymentPaid(eventData: any) {
    this.logger.log('Processing payment.paid event', { 
      checkoutSessionId: eventData.checkout_session_id,
      amount: eventData.amount 
    });

    const checkoutSessionId = eventData.checkout_session_id;
    const amount = eventData.amount;
    const currency = eventData.currency;

    if (!checkoutSessionId) {
      this.logger.error('No checkout session ID found in payment.paid event');
      return;
    }

    // Determine payment method from webhook data
    const paymentMethod = this.extractPaymentMethod(eventData);

    try {
      await this.paymentsService.handleSuccessfulPayment({
        checkoutSessionId,
        amount,
        currency,
        paymentMethod,
        webhookData: eventData
      });

      this.logger.log('✅ Payment processed successfully', { checkoutSessionId });
    } catch (error) {
      this.logger.error('❌ Error processing payment', error.stack);
      throw error;
    }
  }

  private async handlePaymentFailed(eventData: any) {
    this.logger.log('Processing payment.failed event', { 
      checkoutSessionId: eventData.checkout_session_id 
    });

    const checkoutSessionId = eventData.checkout_session_id;

    if (checkoutSessionId) {
      await this.paymentsService.handleFailedPayment({
        checkoutSessionId,
        failureReason: eventData.failure_reason || 'Payment failed',
        webhookData: eventData
      });
    }
  }

  private async handleCheckoutSessionCompleted(eventData: any) {
    this.logger.log('Processing checkout session completed', { 
      sessionId: eventData.id,
      status: eventData.status 
    });

    // Handle checkout session completion if needed
    // This might be redundant if payment.paid already handles everything
  }

  private extractPaymentMethod(data: any): PaymentMethodEnum {
    const possibleFields = [
      'payment_method_type',
      'payment_method',
      'method',
      'type'
    ];

    for (const field of possibleFields) {
      if (data[field]) {
        const method = data[field].toLowerCase();
        
        switch (method) {
          case 'gcash':
            return PaymentMethodEnum.GCASH;
          case 'grab_pay':
          case 'grabpay':
            return PaymentMethodEnum.GRABPAY;
          case 'paymaya':
            return PaymentMethodEnum.PAYMAYA;
          case 'card':
            return PaymentMethodEnum.CARD;
          default:
            break;
        }
      }
    }

    return PaymentMethodEnum.CARD; // Default fallback
  }

  private verifySignature(payload: any, signature: string): boolean {

    return true; 
  }
}