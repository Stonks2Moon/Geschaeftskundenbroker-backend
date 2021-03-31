import { InternalServerErrorException } from "@nestjs/common"
import { BörsenAPI, OrderManager, MarketManager} from "moonstonks-boersenapi";
import { PlaceShareOrder } from "../../depot/dto/share-order.dto"
const credentials = require('../../../stock-exchange.json');
import * as StaticConsts from '../static-consts';

export const stockExchangeApi = new BörsenAPI(credentials.apiToken);
export const orderManager = new OrderManager(stockExchangeApi, `${StaticConsts.WEBHOOK_BASE_URL}/onPlace`, `${StaticConsts.WEBHOOK_BASE_URL}/onMatch`, `${StaticConsts.WEBHOOK_BASE_URL}/onComplete`, `${StaticConsts.WEBHOOK_BASE_URL}/onDelete`);
export {MarketManager as marketManager}

export async function executeApiCall<T>(func: Function, args: any[], manager: any): Promise<T> {
    try {
        return await func.apply(manager, args);
    } catch(e) {
        console.error(e)
        throw new InternalServerErrorException(e, "Stock Exchange API failed");
    }
}

export function getOrderFunction(order: PlaceShareOrder) {
    const orderFunctions = new Map([
        ["market buy", {
            f: orderManager.placeBuyMarketOrder,
            args: ["shareId", "amount"]
        }],
        ["market sell", {
            f: orderManager.placeSellMarketOrder,
            args: ["shareId", "amount"]
        }],

        ["limit buy", {
            f: orderManager.placeBuyLimitOrder,
            args: ["shareId", "amount", "limit"]
        }],
        ["limit sell", {
            f: orderManager.placeSellLimitOrder,
            args: ["shareId", "amount", "limit"]
        }],

        ["stop buy", {
            f: orderManager.placeBuyStopMarketOrder,
            args: ["shareId", "amount", "stop"]
        }],
        ["stop sell", {
            f: orderManager.placeSellStopLimitOrder,
            args: ["shareId", "amount", "stop"]
        }],

        ["stopLimit buy", {
            f: orderManager.placeBuyStopLimitOrder,
            args: ["shareId", "amount", "limit", "stop"]
        }],
        ["stopLimit sell", {
            f: orderManager.placeSellStopLimitOrder,
            args: ["shareId", "amount", "limit", "stop"]
        }],
    ]);

    const orderFunction = orderFunctions.get(`${order.detail} ${order.type}`);
    const args = orderFunction.args.map(key => order[key])

    return {
        func: orderFunction,
        args: args
    }
}