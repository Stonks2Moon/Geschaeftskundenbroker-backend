import { Module } from '@nestjs/common';
import { CustomerModule } from './customer/customer.module';
import { TestEndpointModule } from './test-endpoint/test-endpoint.module';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [CustomerModule, CompanyModule, TestEndpointModule],
})
export class AppModule {}
