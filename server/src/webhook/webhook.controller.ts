import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { OrderCompletedDto, OrderDeletedDto, OrderMatchedDto } from 'moonstonks-boersenapi'
import { WebhookService } from './webhook.service'

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {

    constructor(
        private readonly webhookService: WebhookService
    ) { }

    /**
     * Webhook called on Place
     * @param data 
     */
    @ApiOkResponse({
        description: "Returns nothing"
    })
    @Post('onPlace')
    @HttpCode(200)
    async onPlace(
        @Body() data: any
    ): Promise<void> {
        await this.webhookService.onPlace(data)
    }

    /**
     * Webhook called on match
     * @param data 
     */
    @ApiOkResponse({
        description: "Returns nothing"
    })
    @Post('onMatch')
    @HttpCode(200)
    async onMatch(
        @Body() data: OrderMatchedDto
    ): Promise<void> {
        await this.webhookService.onMatch(data)
    }

    /**
     * Webhook called on complete
     * @param data 
     */
    @ApiOkResponse({
        description: "Returns nothing"
    })
    @Post('onComplete')
    @HttpCode(200)
    async onComplete(
        @Body() data: OrderCompletedDto
    ): Promise<void> {
        await this.webhookService.onComplete(data)
    }

    /**
     * Webhook called on delete
     * @param data 
     */
    @ApiOkResponse({
        description: "Returns nothing"
    })
    @Post('onDelete')
    @HttpCode(200)
    async onDelete(
        @Body() data: OrderDeletedDto
    ): Promise<void> {
        await this.webhookService.onDelete(data)
    }
}
