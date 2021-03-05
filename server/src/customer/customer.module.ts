import { Module } from '@nestjs/common';
import { CompanyController } from 'src/company/company.controller';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
    imports: [CompanyController],
    controllers: [CustomerController],
    providers: [CustomerService],
    exports: [CustomerService]
})
export class CustomerModule {}
