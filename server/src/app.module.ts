import { Module } from '@nestjs/common';
import { CustomerModule } from './customer/customer.module';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [CompanyModule, CustomerModule],
})
export class AppModule {}
