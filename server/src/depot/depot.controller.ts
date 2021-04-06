import { Body, Controller, Delete, HttpCode, Param, Post, Put } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotAcceptableResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { CustomerSession } from 'src/customer/customer-session.model'
import { JobWrapper } from 'src/webhook/dto/job-wrapper.dto'
import { Depot } from './depot.model'
import { DepotService } from './depot.service'
import { CreateDepotDto } from './dto/create-depot.dto'
import { PlaceOrderDto } from './dto/place-order.dto'
import { PlaceShareOrder } from './dto/share-order.dto'

@ApiTags('depot')
@Controller('depot')
export class DepotController {
    constructor(private readonly depotService: DepotService) { }

    /**
     * Shows all depots associated with a customer's company
     * @param customerSession Valid Customer Session
     */
    @ApiOkResponse({
        description: "Returns an array of Depot objects with a DepotSummary",
        type: Depot,
        isArray: true
    })
    @ApiInternalServerErrorResponse({
        description: "Something went wrong"
    })
    @ApiBadRequestResponse({
        description: "Insufficient authorization arguments OR Invalid share ID"
    })
    @ApiNotFoundResponse({
        description: "Share not found"
    })
    @ApiUnauthorizedResponse({
        description: "Customer not authorized"
    })
    @ApiBody({
        description: "Valid CustomerSession as Authentication object",
        type: CustomerSession
    })
    @Post('all')
    @HttpCode(200)
    async showAllDepots(
        @Body() customerSession: CustomerSession
    ): Promise<Array<Depot>> {
        return this.depotService.showAllDepots(customerSession)
    }


    /**
     * Returns a detailed Depot Object with a summary and a position
     * @param depotId Id of the depot
     * @param customerSession Valid Customer Session
     */
    @ApiOkResponse({
        description: "Returns a detailed Depot Object with a summary and a position",
        type: Depot
    })
    @ApiInternalServerErrorResponse({
        description: "Something went wrong"
    })
    @ApiBadRequestResponse({
        description: "Insufficient authorization arguments OR Invalid share ID"
    })
    @ApiNotFoundResponse({
        description: "Depot now found OR Share not found"
    })
    @ApiUnauthorizedResponse({
        description: "Customer not authorized"
    })
    @ApiBody({
        description: "Valid CustomerSession as Authentication object",
        type: CustomerSession
    })
    @Post('show/:depotId')
    @HttpCode(200)
    async showDepotById(
        @Param('depotId') depotId: string,
        @Body() customerSession: CustomerSession
    ): Promise<Depot> {
        return this.depotService.showDepotById(depotId, customerSession)
    }


    /**
     * Used to place an oder (buy / sell)
     * @param placeOrder Object with all information which are needed to perform the action
     * @returns an array of PlaceShareOrder objects
     */
    @ApiCreatedResponse({
        description: "An array with all orders is provided (if algorithmic trading is used, there is more than one item in it).",
        isArray: true,
        type: PlaceShareOrder
    })
    @ApiNotAcceptableResponse({
        description: "Market is currently closed",
    })
    @ApiInternalServerErrorResponse({
        description: "Something went wrong"
    })
    @ApiUnauthorizedResponse({
        description: "Customer not authorized"
    })
    @ApiBadRequestResponse({
        description: "Insufficient authorization arguments OR doesn't fulfill algorithmic trading requirement OR invalid share ID"
    })
    @ApiNotFoundResponse({
        description: "Share not found"
    })
    @ApiBody({
        description: "Place an order",
        type: PlaceOrderDto
    })
    @Put('order')
    async placeOrder(
        @Body() placeOrder: PlaceOrderDto
    ): Promise<Array<PlaceShareOrder>> {
        return this.depotService.placeOrder(placeOrder)
    }


    /**
     * Creates a depot from the given information
     * @param createDepot Object containing a valid CustomerSession and the Depot Information
     * @returns a Depot object
     */
    @ApiCreatedResponse({
        description: "Returns a Depot object of the created depot",
        type: Depot
    })
    @ApiInternalServerErrorResponse({
        description: "Something went wrong"
    })
    @ApiUnauthorizedResponse({
        description: "Customer not authorized"
    })
    @ApiBadRequestResponse({
        description: "Insufficient authorization arguments OR Invalid name OR invalid share ID"
    })
    @ApiBody({
        description: "CreateDepotDto containing a valid CustomerSession, a name and an optional description",
        type: CreateDepotDto
    })
    @Put()
    async createDepot(
        @Body() createDepot: CreateDepotDto
    ): Promise<Depot> {
        return await this.depotService.createDepot(createDepot)
    }

    /**
     * Used to show open orders
     * @param depotId id of depot
     * @param customerSession customer session for login
     * @returns an array with pending orders
     */
    @ApiBody({
        description: "Valid CustomerSession as Authentication object",
        type: CustomerSession
    })
    @ApiOkResponse({
        description: "Returns the pending orders for a depot",
        type: JobWrapper,
        isArray: true
    })
    @ApiInternalServerErrorResponse({
        description: "Something went wrong"
    })
    @ApiUnauthorizedResponse({
        description: "Customer not authorized"
    })
    @ApiBadRequestResponse({
        description: "Insufficient authorization arguments"
    })
    @ApiNotFoundResponse({
        description: "Depot now found OR Company not found OR Adress not found"
    })
    @Post('order/all/:depotId')
    @HttpCode(200)
    async showPendingOrders(
        @Param('depotId') depotId: string,
        @Body() customerSession: CustomerSession
    ) {
        return await this.depotService.showPendingOrders(depotId, customerSession)
    }


    /**
     * Used to delete an open order
     * @param orderId id of the order
     * @param customerSession session of customer for login
     * @returns the deleted order
     */
    @ApiBody({
        description: "Valid CustomerSession as Authentication object",
        type: CustomerSession
    })
    @ApiNotAcceptableResponse({
        description: "Market is currently closed",
    })
    @ApiOkResponse({
        description: "Successfully deleted order",
        type: PlaceShareOrder
    })
    @ApiInternalServerErrorResponse({
        description: "Something went wrong"
    })
    @ApiUnauthorizedResponse({
        description: "Customer not authorized"
    })
    @ApiBadRequestResponse({
        description: "Insufficient authorization arguments"
    })
    @ApiNotFoundResponse({
        description: "Depot now found OR Company not found OR Adress not found"
    })
    @Delete('order/:orderId')
    async deletePendingOrder(
        @Param('orderId') orderId: string,
        @Body() customerSession: CustomerSession
    ) {
        return await this.depotService.deletePendingOrder(orderId, customerSession);
    }
}
