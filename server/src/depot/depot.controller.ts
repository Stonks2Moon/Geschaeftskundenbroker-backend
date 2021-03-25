import { Body, Controller, HttpCode, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiNotAcceptableResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CustomerSession } from 'src/customer/customer-session.model';
import { Depot } from './depot.model';
import { DepotService } from './depot.service';
import { CreateDepotDto } from './dto/create-depot.dto';
import { PlaceOrderDto } from './dto/place-order.dto';
import { ReturnShareOrder } from './dto/share-order.dto';

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
    @ApiBody({
        description: "Valid CustomerSession as Authentication object",
        type: CustomerSession
    })
    @Post('all')
    @HttpCode(200)
    async showAllDepots(
        @Body() customerSession: CustomerSession
    ): Promise<Array<Depot>> {
        return this.depotService.showAllDepots(customerSession);
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
        return this.depotService.showDepotById(depotId, customerSession);
    }


    /**
     * 
     * @param placeOrder 
     * @returns 
     */
    @ApiCreatedResponse({
        description: "Returns an order object",
        type: ReturnShareOrder
    })
    @ApiNotAcceptableResponse({
        description: "Market is currently closed",
    })
    @ApiBody({
        description: "Place an order",
        type: PlaceOrderDto
    })
    @Put('order')
    async placeOrder(
        @Body() placeOrder: PlaceOrderDto
    ): Promise<ReturnShareOrder> {
        return this.depotService.placeOrder(placeOrder);
    }


    /**
     * Creates a depot from the given information
     * @param createDepot Object containing a valid CustomerSession and the Depot Information
     */
    @ApiCreatedResponse({
        description: "Returns a Depot object of the created depot.",
        type: Depot
    })
    @ApiBody({
        description: "CreateDepotDto containing a valid CustomerSession, a name and an optional description.",
        type: CreateDepotDto
    })
    @Put()
    async createDepot(
        @Body() createDepot: CreateDepotDto
    ): Promise<Depot> {
        return await this.depotService.createDepot(createDepot);
    }
}
