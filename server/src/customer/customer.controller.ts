import { Body, Controller, HttpCode, Post, Put } from '@nestjs/common';
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

    /**
     * Receives Login Information and returns a logged in user
     * @param login LoginDto containing either a session or a Email/Password
     * @returns 
     */
    @ApiBody({
        description: "Input for customer login, only one parameters is required. Either a CustomerSession or a Email/Password.",
        type: LoginDto
    })
    @ApiOkResponse({
        description: "Returns a Customer and CustomerSession object"
    })
    @Post('login')
    @HttpCode(200)
    async login(
        @Body() login: LoginDto
    ): Promise<{
        customer: Customer,
        session: CustomerSession
    }> {
        return await this.customerService.customerLogin(login);
    }


    /**
     * Create a customer provided the given information
     * @param customer CustomerDto object 
     */
    @ApiBody({
        description: "CustomerDto object containing necessary information to create a new user/customer",
        type: CustomerDto
    })
    @ApiCreatedResponse({
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
