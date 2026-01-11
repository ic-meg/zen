export class CreatePaymentDto {
  amount: number;
  currency: string;
  description?: string;
  paymentMethod: PaymentMethodEnum;
  checkoutSessionId: string;
}

export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethodEnum {
  GCASH = 'GCash',
  GRABPAY = 'GrabPay',
  PAYMAYA = 'PayMaya',
  CARD = 'Credit/Debit Card',
  CASH_ON_DELIVERY = 'Cash on Delivery'
}
