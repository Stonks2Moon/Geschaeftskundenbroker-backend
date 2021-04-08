import { InternalServerErrorException } from "@nestjs/common"
import { BörsenAPI, OrderManager, MarketManager } from "moonstonks-boersenapi"
import { PlaceShareOrder } from "../../depot/dto/share-order.dto"
import * as CONST from '../const'

export const stockExchangeApi = new BörsenAPI(CONST.STOCK_EXCHANGE_API_TOKEN.BUSINESS)
export const orderManager = new OrderManager(
                                    stockExchangeApi, 
                                    CONST.JOB_CALLBACKS.ON_PLACE, 
                                    CONST.JOB_CALLBACKS.ON_MATCH, 
                                    CONST.JOB_CALLBACKS.ON_COMPLETE, 
                                    CONST.JOB_CALLBACKS.ON_DELETE
                                )

export const lqStockExchangeApi = new BörsenAPI(CONST.STOCK_EXCHANGE_API_TOKEN.LIQUID)
export const lqOrderManager = new OrderManager(
                                    lqStockExchangeApi, 
                                    CONST.JOB_CALLBACKS.ON_PLACE, 
                                    CONST.JOB_CALLBACKS.ON_MATCH, 
                                    CONST.JOB_CALLBACKS.ON_COMPLETE, 
                                    CONST.JOB_CALLBACKS.ON_DELETE
                                )

export { MarketManager as marketManager }

/**
 * Method to execute API calls to stock-exchange (to avoid using try/catch + await everytime it is used)
 * @param func function to be called
 * @param args arguments to be applied to the function
 * @param manager manager to be used (e.g. Ordermanager, Marketmanager, ...)
 * @returns the output from API call execution
 */
export async function executeApiCall<T>(func: Function, args: any[], manager: any): Promise<T> {
    try {
        return await func.apply(manager, args)
    } catch (e) {
        // console.error(e)
        throw new InternalServerErrorException(e, "Stock Exchange API failed")
    }
}

/**
 * Method to get the correct function for buy/sell oder and market, stop, limit and stopLimit action
 * This is much cleaner code than a nested switch case / if + else statements
 * @param order order to be placed
 * @returns an object with the function to be executed and the object keys which are needed for applying the function
 */
export function getOrderFunction(order: PlaceShareOrder) {
    // map of all possible combinations for orders
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
    ])

    // get the object from map above
    const orderFunction = orderFunctions.get(`${order.detail} ${order.type}`)
    // get the arguments for the function
    const args = orderFunction.args.map(key => order[key])

    return {
        func: orderFunction,
        args: args
    }
}