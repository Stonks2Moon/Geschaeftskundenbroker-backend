import { Body, Controller, Get, Post } from '@nestjs/common';
import { CustomerSession } from './customer-session.model';
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

    @Get('test')
    async testCall() {
        return "Hello World";
    }
}
