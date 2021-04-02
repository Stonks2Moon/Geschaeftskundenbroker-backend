import { Module } from '@nestjs/common'
import { WebhookService } from './webhook.service'
import { WebhookController } from './webhook.controller'
import { ShareModule } from 'src/share/share.module'
import { DepotModule } from 'src/depot/depot.module'

@Module({
  imports: [ShareModule, DepotModule],
  providers: [WebhookService],
  controllers: [WebhookController]
})
export class WebhookModule {}

