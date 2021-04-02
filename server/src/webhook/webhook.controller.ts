import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WebhookService } from './webhook.service'

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {

    constructor(
        private readonly webhookService: WebhookService = new WebhookService()
    ) { }

    /**
     * Webhook called on Place
     * @param data 
     */
    @Post('onPlace')
    async onPlace(
        @Body() data: any
    ): Promise<void> {
        await this.webhookService.onPlace(data)
    }

    /**
     * Webhook called on match
     * @param data 
     */
    @Post('onMatch')
    async onMatch(
        @Body() data: any
    ): Promise<void> {
        await this.webhookService.onMatch(data)
    }

    /**
     * Webhook called on complete
     * @param data 
     */
    @Post('onComplete')
    async onComplete(
        @Body() data: any
    ): Promise<void> {
        await this.webhookService.onComplete(data)
    }

    /**
     * Webhook called on delete
     * @param data 
     */
    @Post('onDelete')
    async onDelete(
        @Body() data: any
    ): Promise<void> {
        await this.webhookService.onDelete(data)
    }
}
