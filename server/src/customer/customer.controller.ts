import { Body, Controller, Post, Put } from '@nestjs/common';
import { CustomerSession } from './customer-session.model';
import { Customer } from './customer.model';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }
    
    
    @Post('login')
    async login(
        @Body('login') login?: {
            email: string,
            password: string
        },
        @Body('session') session?: CustomerSession
    ) {
        return await this.customerService.customerLogin(login, session);
    }

    @Put()
    async register(
        @Body('customer') customer: Customer
    ): Promise<{
        customer: Customer, 
        session: CustomerSession
    }> {
        return await this.customerService.registerCustomer(customer);
    }

}
