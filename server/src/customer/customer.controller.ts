import { Body, Controller, HttpCode, Post, Put, Res } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CustomerSession } from './customer-session.model';
import { Customer } from './customer.model';
import { CustomerService } from './customer.service';
import { CustomerDto } from './dto/customer.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('customer')
@Controller('customer')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @ApiBody({description:"Input for customer login, only one parameters is required", type: LoginDto})
    @ApiOkResponse({
        description: "Returns a Customer and CustomerSession object"
    })
    @Post('login')
    @HttpCode(200)
    async login(
        @Body() wrapper: LoginDto
    ): Promise<{
        customer: Customer,
        session: CustomerSession
    }> {
        return await this.customerService.customerLogin(wrapper.login, wrapper.session);
    }

    @ApiBody({description: "Blabla", type: CustomerDto})
    @ApiOkResponse({
        description: "Returns a Customer and CustomerSession object"
    })
    @Put()
    async register(
        @Body() customer: CustomerDto
    ): Promise<{
        customer: Customer,
        session: CustomerSession
    }> {
        return await this.customerService.registerCustomer(customer);
    }

}
