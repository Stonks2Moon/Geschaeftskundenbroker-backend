import { Body, Controller, Get, HttpCode, Param, Post, Put } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { CustomerSession } from './customer-session.model'
import { Customer } from './customer.model'
import { CustomerService } from './customer.service'
import { CustomerDto } from './dto/customer.dto'
import { LoginDto } from './dto/login.dto'

@ApiTags('customer')
@Controller('customer')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    /**
     * Receives Login Information and returns a logged in user
     * @param login LoginDto containing either a session or a Email/Password
     * @returns a customer + valid session
     */
    @ApiBody({
        description: "Input for customer login, only one parameters is required. Either a CustomerSession or a Email/Password.",
        type: LoginDto
    })
    @ApiOkResponse({
        description: "Returns a Customer and CustomerSession object"
    })
    @ApiInternalServerErrorResponse({
        description: "Something went wrong"
    })
    @ApiUnauthorizedResponse({
        description: "User is not authorized to login"
    })
    @ApiNotFoundResponse({
        description: "Customer not found"
    })
    @ApiBadRequestResponse({
        description: "Insufficient authorization arguments"
    })
    @Post('login')
    @HttpCode(200)
    async login(
        @Body() login: LoginDto
    ): Promise<{
        customer: Customer,
        session: CustomerSession
    }> {
        return await this.customerService.customerLogin(login)
    }


    /**
     * Create a customer provided the given information
     * @param customer CustomerDto object
     * @returns a customer + valid session
     */
    @ApiBody({
        description: "CustomerDto object containing necessary information to create a new user/customer",
        type: CustomerDto
    })
    @ApiCreatedResponse({
        description: "Returns a Customer and CustomerSession object"
    })
    @ApiInternalServerErrorResponse({
        description: "Something went wrong"
    })
    @ApiNotFoundResponse({
        description: "Company not found"
    })
    @ApiBadRequestResponse({
        description: "Email already registered OR invalid email OR invalid first or last name OR invalid company code"
    })
    @Put()
    async register(
        @Body() customer: CustomerDto
    ): Promise<{
        customer: Customer,
        session: CustomerSession
    }> {
        return await this.customerService.registerCustomer(customer)
    }

    @ApiBody({
        description: "CustomerSession object for login",
        type: CustomerSession
    })
    @ApiOkResponse({
        type: Customer,
        description: "Customer information as object"
    })
    @ApiInternalServerErrorResponse({
        description: "Something went wrong"
    })
    @ApiUnauthorizedResponse({
        description: "User is not authorized to login"
    })
    @ApiNotFoundResponse({
        description: "Customer not found"
    })
    @ApiBadRequestResponse({
        description: "Insufficient authorization arguments"
    })
    @Post(':customerId')
    @HttpCode(200)
    async getCustomer(
        @Param('customerId') id: string,
        @Body() session: CustomerSession
    ): Promise<Customer> {
        return await this.customerService.getCustomer(id, session)
    }
}
