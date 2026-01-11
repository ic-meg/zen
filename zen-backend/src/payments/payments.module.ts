import { Module, forwardRef } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { WebhookController } from './webhook.controller';
import { PaymongoService } from './paymongo.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [forwardRef(() => OrdersModule)],
  providers: [PaymentsService, PaymongoService],
  controllers: [PaymentsController, WebhookController],
  exports: [PaymongoService]
})
export class PaymentsModule {}
