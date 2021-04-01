import { Module } from '@nestjs/common';
import { CustomerModule } from './customer/customer.module';
import { CompanyModule } from './company/company.module';
import { ShareModule } from './share/share.module';
import { DepotModule } from './depot/depot.module';
import { UpdateShares} from './util/stock-exchange/share-updates';
import { MetaModule } from './meta/meta.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [CompanyModule, CustomerModule, ShareModule, DepotModule, WebhookModule, MetaModule],
  providers: [UpdateShares],
})
export class AppModule { }
