export interface PayMongoWebhookPayload {
  data: {
    id: string;
    type: string;
    attributes: {
      type: string;
      livemode: boolean;
      data: {
        id: string;
        type: string;
        attributes: PayMongoEventAttributes;
      };
      previous_data?: any;
      created_at: number;
      updated_at: number;
    };
  };
}

export interface PayMongoEventAttributes {
  amount: number;
  currency: string;
  description?: string;
  statement_descriptor?: string;
  status: string;
  checkout_session_id?: string;
  payment_method_type?: string;
  payment_method?: string;
  [key: string]: any;
}

export interface WebhookHeaders {
  'paymongo-signature'?: string;
  'content-type'?: string;
  [key: string]: string | undefined;
}