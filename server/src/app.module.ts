import { Module } from '@nestjs/common';
import { CustomerModule } from './customer/customer.module';
import { CompanyModule } from './company/company.module';
import { ShareModule } from './share/share.module';
import { DepotModule } from './depot/depot.module';

@Module({
  imports: [CompanyModule, CustomerModule, ShareModule, DepotModule]
})
export class AppModule { }
