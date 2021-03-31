import { Body, Controller, NotImplementedException, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Order } from 'moonstonks-boersenapi';
import { WebhookService } from './webhook.service'

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {

    constructor(
        private readonly webhookService: WebhookService = new WebhookService()
    ) { }

    @Post('onPlace')
    async onPlace(
        @Body() data: any
    ): Promise<void> {
        await this.webhookService.onPlace(data)
    }

    @Post('onMatch')
    async onMatch(
        @Body() data: any
    ): Promise<void> {
        await this.webhookService.onMatch(data)
    }

    @Post('onComplete')
    async onComplete(
        @Body() data: any
    ): Promise<void> {
        await this.webhookService.onComplete(data)
    }

    @Post('onDelete')
    async onDelete(
        @Body() data: any
    ): Promise<void> {
        await this.webhookService.onDelete(data)
    }
}
