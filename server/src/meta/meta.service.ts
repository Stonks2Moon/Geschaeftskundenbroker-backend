import { Injectable } from '@nestjs/common';
import * as CONST from "../util/const"
import { StockExchangePricing } from './dto/pricing.dto';
const axios = require('axios');

@Injectable()
export class MetaService {
    public async exportPricing() {
        const businessPricing: StockExchangePricing = (await axios.get(CONST.STOCK_EXCHANGE_PRICING_API_URL)).data
        return businessPricing
    }
}
