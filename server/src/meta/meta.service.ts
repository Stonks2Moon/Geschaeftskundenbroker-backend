import { Injectable } from '@nestjs/common';
import * as CONST from "../util/const"
import { StockExchangePricing } from './dto/pricing.dto';
const axios = require('axios');

@Injectable()
export class MetaService {
    /**
     * Used to get pricing from stock exchange api
     * @returns The pricing from the stock exchange for business broker
     */
    public async exportPricing() {
        // Get the pricing for business broker from stockexchange and redirects it to endpoint
        const businessPricing: StockExchangePricing = (await axios.get(CONST.STOCK_EXCHANGE_PRICING_API_URL)).data
        return businessPricing
    }
}
