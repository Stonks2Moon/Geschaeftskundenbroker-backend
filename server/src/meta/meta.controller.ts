import { Controller, Get } from '@nestjs/common'
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import * as CONST from '../util/const'
import { StockExchangePricing } from './dto/pricing.dto'
import { MetaService } from './meta.service'

@ApiTags('meta')
@Controller('meta')
export class MetaController {

    constructor(private readonly metaService: MetaService) { }

    /**
     * Used to give constant variables used in backend to frontend
     * @returns an object with used backend constants
     */
    @ApiOkResponse({
        schema: {
            properties: {
                'DEFAULT_SEARCH_LIMIT': { type: 'number' },
                'ALG_SPLIT_THRESHOLD': { type: 'number' },
                'ALGORITHMS': {
                    type: 'object',
                    properties: {
                        'NO_ALG': { type: 'number' },
                        'SPLIT_ALG': { type: 'number' },
                    }
                }
            }
        }
    })
    @ApiInternalServerErrorResponse({
        description: "Something went wrong"
    })
    @Get('const')
    async exportCONST() {
        return {
            DEFAULT_SEARCH_LIMIT: CONST.DEFAULT_SEARCH_LIMIT,
            ALG_SPLIT_THRESHOLD: CONST.ALG_SPLIT_THRESHOLD,
            ALGORITHMS: CONST.ALGORITHMS
        }
    }

    @ApiOkResponse({
        description: "Returns an Pricing object",
        type: StockExchangePricing
    })
    @ApiInternalServerErrorResponse({
        description: "Something went wrong"
    })
    @Get('pricing')
    async exportPricing() {
        return await this.metaService.exportPricing()
    }
}
