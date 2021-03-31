import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';

@Module({
  providers: [WebhookService],
  controllers: [WebhookController]
})
export class WebhookModule {}
