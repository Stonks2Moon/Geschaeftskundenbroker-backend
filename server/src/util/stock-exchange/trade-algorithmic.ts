import { PlaceShareOrder } from "src/depot/dto/share-order.dto";

export class TradeAlgorithmic {

    // TODO
    public static splitBuyOrderInSmalerOrders(order: PlaceShareOrder, splitThreshold: number): Array<PlaceShareOrder> {
        const remainder = order.amount % splitThreshold;

        let orderArray: Array<PlaceShareOrder> = [];

        for (let i = 0; i < Math.floor(order.amount / splitThreshold); i++) {
            const o: PlaceShareOrder = {
                shareId: order.shareId,
                orderId: order.orderId,
                depotId: order.depotId,
                amount: splitThreshold,
                type: order.type,
                detail: order.detail,
                limit: order.limit,
                stop: order.stop,
                stopLimit: order.stopLimit,
                market: order.market
            }

            orderArray.push(o);
        }

        const o: PlaceShareOrder = {
            shareId: order.shareId,
            orderId: order.orderId,
            depotId: order.depotId,
            amount: remainder,
            type: order.type,
            detail: order.detail,
            limit: order.limit,
            stop: order.stop,
            stopLimit: order.stopLimit,
            market: order.market
        }

        orderArray.push(o);

        return orderArray;
    }
}