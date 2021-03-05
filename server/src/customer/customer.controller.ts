import { Body, Controller, Get, Post, Put } from '@nestjs/common';
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

    @Put('register')
    async register(
        @Body('customer') customer: {
            firstName: string,
            lastName: string,
            email: string,
            password: string,
            companyCode: string
        }
    ): Promise<{
        customer: Customer, 
        session: CustomerSession
    }> {
        return await this.customerService.registerCustomer(customer);
    }

}
