import { Body, Controller, HttpCode, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
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


    @ApiOkResponse({
        description: "Returns an array of Depot objects",
        type: Depot,
        isArray: true
    })
    @ApiBody({
        description: "Authentication",
        type: CustomerSession
    })
    @Post('all')
    @HttpCode(200)
    async showAllDepots(
        @Body() customerSession: CustomerSession
    ): Promise<Array<Depot>> {
        return this.depotService.showAllDepots(customerSession);
    }



    @ApiOkResponse({
        description: "Returns a Depot object",
        type: Depot
    })
    @ApiBody({
        description: "Authentication",
        type: CustomerSession
    })
    @Post('show/:depotId')
    @HttpCode(200)
    async showDepotById(
        @Param() depotId: string,
        @Body() customerSession: CustomerSession
    ): Promise<Depot> {
        return this.depotService.showDepotById(depotId, customerSession);
    }



    @ApiCreatedResponse({
        description: "Returns an order object",
        type: ReturnShareOrder
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



    @ApiCreatedResponse({
        description: "Returns a Depot object",
        type: Depot
    })
    @ApiBody({
        description: "Create a depot",
        type: CreateDepotDto
    })
    @Put()
    async createDepot(
        @Body() createDepot: CreateDepotDto
    ): Promise<Depot> {
        return await this.depotService.createDepot(createDepot);
    }
}
