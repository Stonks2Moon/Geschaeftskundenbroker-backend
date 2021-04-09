import { Body, Controller, Delete, HttpCode, Param, Post, Put } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotAcceptableResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from '@nestjs/swagger'
import { CustomerSession } from 'src/customer/customer-session.model'
import { JobWrapper } from 'src/webhook/dto/job-wrapper.dto'
import { Depot } from './depot.model'
import { DepotService } from './depot.service'
import { CreateDepotDto } from './dto/create-depot.dto'
import { LpPosition } from './dto/lp-position.dto'
import { PlaceOrderDto } from './dto/place-order.dto'
import { RegisterLpDto } from './dto/lp-register.dto'
import { PlaceShareOrder, ReturnShareOrder } from './dto/share-order.dto'
import { LpCancelDto } from './dto/lp-cancel.dto'
import { runInThisContext } from 'node:vm'

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
    @ApiUnprocessableEntityResponse({
        description: "User has not enough shares to sell the given amount"
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


    @ApiBody({
        description: "Valid customer session for login",
        type: CustomerSession
    })
    @ApiInternalServerErrorResponse({
        description: "Something went wrong"
    })
    @ApiUnauthorizedResponse({
        description: "Customer not authorized"
    })
    @ApiBadRequestResponse({
        description: "Invalid input arguments"
    })
    @ApiNotFoundResponse({
        description: "Depot now found OR Company not found OR Adress not found"
    })
    @ApiOkResponse({
        description: "Returns the depot history",
        isArray: true,
        type: ReturnShareOrder
    })
    @Post('order/completed/:depotId')
    @HttpCode(200)
    async getDepotHistory(
        @Param('depotId') depotId: string,
        @Body() customerSession: CustomerSession
    ): Promise<ReturnShareOrder[]> {
        return await this.depotService.getDepotHistory(depotId, customerSession)
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
    @Post('order/pending/:depotId')
    @HttpCode(200)
    async showPendingOrders(
        @Param('depotId') depotId: string,
        @Body() customerSession: CustomerSession
    ): Promise<Array<JobWrapper>> {
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
    ): Promise<PlaceShareOrder> {
        return await this.depotService.deletePendingOrder(orderId, customerSession);
    }


    /**
     * Registers a depot of a company as a LP
     * @param registerLp LP information and authorization
     * @returns Confirmation info
     */
    @ApiBody({
        description: "A valid RegisterLpDTO object",
        type: RegisterLpDto
    })
    @ApiBadRequestResponse({
        description: "Invalid input parameter"
    })
    @ApiUnauthorizedResponse({
        description: "Invalid authorization"
    })
    @ApiOkResponse({
        description: "Returns a confirmation of the successful registration of LP",
        type: LpPosition
    })
    @ApiNotAcceptableResponse({
        description: "Depot doesn't have share or too few shares"
    })
    @Post('lp/register')
    @HttpCode(200)
    async registerAsLP(
        @Body() registerLp: RegisterLpDto
    ): Promise<LpPosition> {
        return await this.depotService.registerLp(registerLp)
    }


    /**
     * Cancels a LP position and deletes it
     * @param cancelLpDto information and authorization of the LP position
     * @returns the cancelled LP position
     */
    @ApiBody({
        description: "A valid LpCancelDto object",
        type: LpCancelDto
    })
    @ApiBadRequestResponse({
        description: "Invalid input parameter"
    })
    @ApiUnauthorizedResponse({
        description: "Invalid authorization"
    })
    @ApiNotFoundResponse({
        description: "Depot position OR LP position not found"
    })
    @ApiOkResponse({
        description: "Returns a confirmation of the successful deletion of LP",
        type: LpPosition
    })
    @Post('lp/cancel')
    @HttpCode(200)
    async cancelLp(
        @Body() cancelLpDto: LpCancelDto
    ): Promise<LpPosition> {
        return await this.depotService.cancelLp(cancelLpDto)
    }

    /**
     * Returns the LP positions for a depot
     * @param depotId id of depot
     * @param customerSession valid customer session for login
     * @returns an array of LpPosition objects
     */
    @ApiBody({
        description: "A valid customer session",
        type: CustomerSession
    })
    @ApiOkResponse({
        description: "Returns a confirmation of the successful deletion of LP",
        isArray: true,
        type: LpPosition
    })
    @ApiUnauthorizedResponse({
        description: "Invalid customer session"
    })
    @ApiNotFoundResponse({
        description: "Depot not found"
    })
    @ApiBadRequestResponse({
        description: "Invalid input parameter"
    })
    @Post('lp/show/:depotId')
    @HttpCode(200)
    async getLpsForDepot(
        @Param('depotId') depotId: string,
        @Body() customerSession: CustomerSession
    ): Promise<LpPosition[]> {
        return this.depotService.getLpsForDepot(depotId, customerSession)
    }
}
