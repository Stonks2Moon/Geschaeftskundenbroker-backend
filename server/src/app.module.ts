import { Module } from '@nestjs/common';
import { CustomerController } from './customer/customer.controller';
import { CustomerService } from './customer/customer.service';
import { CustomerModule } from './customer/customer.module';
import { TestEndpointModule } from './test-endpoint/test-endpoint.module';

@Module({
  imports: [CustomerModule, TestEndpointModule],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class AppModule {}
