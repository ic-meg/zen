import { Injectable, Logger, BadRequestException } from '@nestjs/common';

@Injectable()
export class PaymongoService {
  private readonly logger = new Logger(PaymongoService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.paymongo.com/v1';

  constructor() {
    this.apiKey = process.env.PAYMONGO_SECRET_KEY || '';
    if (!this.apiKey) {
      throw new Error('PAYMONGO_SECRET_KEY is required');
    }
  }

  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
    };
  }

  async createCheckoutSession(data: {
    amount: number;
    currency: string;
    description: string;
    line_items: Array<{
      name: string;
      quantity: number;
      amount: number;
      currency: string;
      description?: string;
    }>;
    success_url: string;
    cancel_url: string;
    billing?: {
      name: string;
      email: string;
      phone?: string;
    };
  }) {
    try {
      this.logger.log('Creating PayMongo checkout session', { 
        amount: data.amount, 
        currency: data.currency,
        line_items_count: data.line_items?.length 
      });

      const response = await fetch(`${this.baseUrl}/checkout_sessions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          data: {
            attributes: {
              send_email_receipt: true,
              show_description: true,
              show_line_items: true,
              cancel_url: data.cancel_url,
              success_url: data.success_url,
              line_items: data.line_items,
              payment_method_types: [
                'card',
                'gcash',
                'paymaya',
                'grab_pay'
              ],
              description: data.description,
              ...(data.billing && {
                billing: {
                  name: data.billing.name,
                  email: data.billing.email,
                  ...(data.billing.phone && { phone: data.billing.phone })
                }
              })
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error('PayMongo API error', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new BadRequestException(`PayMongo API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      this.logger.log('PayMongo checkout session created successfully', {
        sessionId: result.data?.id,
        checkout_url: result.data?.attributes?.checkout_url
      });

      return {
        id: result.data.id,
        checkout_url: result.data.attributes.checkout_url,
        payment_intent: result.data.attributes.payment_intent,
        customer_email: result.data.attributes.customer_email,
        line_items: result.data.attributes.line_items
      };

    } catch (error) {
      this.logger.error('Failed to create PayMongo checkout session', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to create payment session');
    }
  }

  async retrieveCheckoutSession(sessionId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/checkout_sessions/${sessionId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new BadRequestException(`Failed to retrieve session: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;

    } catch (error) {
      this.logger.error('Failed to retrieve PayMongo checkout session', error);
      throw new BadRequestException('Failed to retrieve payment session');
    }
  }
}