import { PlaceShareOrder } from "src/depot/dto/share-order.dto";
import { Share } from "src/share/share.model";
import { ShareService } from "src/share/share.service";
import * as CONST from "../const";
export class TradeAlgorithm {
    private static shareService: ShareService = new ShareService();

    /**
     * Algorithm to split bi orders into multiple smaller ones
     * @param order Big order to be placed
     * @returns an array of smaller orders
     */
    public static async splitBuyOrderInSmallerOrders(order: PlaceShareOrder): Promise<Array<PlaceShareOrder>> {

        // Get value of a share and split the order into batches
        // Batchsize is calculated by using the orderValue and the number of orders
        const batchValue = CONST.ALG_SPLIT_BATCH_VALUE
        const share: Share = await this.shareService.getShareData(order.shareId);
        const orderValue: number = order.amount * share.lastRecordedValue;
        const numberOfOrders: number = Math.floor(orderValue / batchValue) + (orderValue % batchValue > 0 ? 1 : 0);

        const batchSize: number = Math.floor(order.amount / (numberOfOrders));
        const additionToLast: number = order.amount - (numberOfOrders) * batchSize

        // Splits the order in smaler ones and add them to an array
        // After this there is an remaining part whic is added to array later
        let orderArray: Array<PlaceShareOrder> = [];
        for (let i = 0; i < numberOfOrders; i++) {
            const o: PlaceShareOrder = {
                shareId: order.shareId,
                orderId: order.orderId,
                depotId: order.depotId,
                amount: batchSize,
                type: order.type,
                detail: order.detail,
                limit: order.limit,
                stop: order.stop,
                stopLimit: order.stopLimit,
                market: order.market,
                validity: order.validity
            }
            orderArray.push(o);
        }

        // Add the remaining stocks to the partionated orders in array to get mostly even orders
        for (let i = additionToLast - 1; i >= 0; i--) {
            orderArray[i % numberOfOrders].amount += 1
        }

        return orderArray
    }
}