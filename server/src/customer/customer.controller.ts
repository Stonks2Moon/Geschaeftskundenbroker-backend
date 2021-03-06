import { Body, Controller, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CustomerSession } from './customer-session.model';
import { Customer } from './customer.model';
import { CustomerService } from './customer.service';

@ApiTags('customer')
@Controller('customer')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @ApiOkResponse({
        description: "Returns a Customer and CustomerSession object"
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                "login?": {
                    type: "object",
                    properties: {
                        "email": {
                            type: "string"
                        },
                        "password": {
                            type: "string"
                        }
                    }
                },
                "session?": {
                    type: "object",
                    properties: {
                        "customerId": {
                            type: "string"
                        },
                        "sessionId": {
                            type: "string"
                        }
                    }
                }
            }
        },
    })
    @Post('login')
    async login(
        @Body('login') login?: {
            email: string,
            password: string
        },
        @Body('session') session?: CustomerSession
    ): Promise<{
        customer: Customer,
        session: CustomerSession
    }> {
        return await this.customerService.customerLogin(login, session);
    }

    @ApiOkResponse({
        description: "Returns a Customer and CustomerSession object"
    })
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
