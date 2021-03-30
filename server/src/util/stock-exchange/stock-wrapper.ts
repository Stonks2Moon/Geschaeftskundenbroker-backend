import { InternalServerErrorException } from "@nestjs/common"
import { BörsenAPI, OrderManager, MarketManager} from "moonstonks-boersenapi";
import { PlaceShareOrder } from "../../depot/dto/share-order.dto"

export const stockExchangeApi = new BörsenAPI('moonstonks token');
export const orderManager = new OrderManager(stockExchangeApi, 'onPlace', 'onMatch', 'onComplete', 'onDelete');
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
    // const stockExchangeApi = new BörsenAPI('moonstonks token');
    // const orderManager =// new OrderManager(stockExchangeApi, 'onPlace', 'onMatch', 'onComplete', 'onDelete');

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