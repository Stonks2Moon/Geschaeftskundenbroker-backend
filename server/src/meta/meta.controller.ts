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

    /**
     * Used to get pricing from stock exchange api
     * @returns The pricing from the stock exchange for business broker
     */
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

    // @Get("test")
    // async test() {
    //     let shares: Array<Share> = []
    //         const axios = require("axios")
    //         try {
    //             const apiShares = (await axios.get('https://google.com')).data
    //             console.log(typeof apiShares)
    //             if (typeof apiShares === "object") {
    //                 shares = apiShares
    //             } else if (typeof apiShares === "string") {
    //                 shares = JSON.parse(apiShares)
    //             } else {
    //                 throw new Error("Unhandled return type for stock exchange /share")
    //             }
    //         } catch (e) {
    //             console.error("Stock Exchange not available", e)
    //             return
    //         }

    //         console.log(shares)
    // }
}
