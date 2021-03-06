import { Module } from '@nestjs/common';
import { CompanyModule } from 'src/company/company.module';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
    imports: [CompanyModule],
    controllers: [CustomerController],
    providers: [CustomerService],
    exports: [CustomerService]
})
export class CustomerModule { }
