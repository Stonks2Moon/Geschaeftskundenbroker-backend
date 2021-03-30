import { PlaceShareOrder } from "src/depot/dto/share-order.dto";
import { Share } from "src/share/share.model";
import { ShareService } from "src/share/share.service";
import * as StaticConsts from "../static-consts";
export class TradeAlgorithm {
    private static shareService: ShareService = new ShareService();

    public static async splitBuyOrderInSmallerOrders(order: PlaceShareOrder): Promise<Array<PlaceShareOrder>> {

        const batchValue = StaticConsts.ALG_SPLIT_BATCH_VALUE
        const share: Share = await this.shareService.getShareData(order.shareId);
        const orderValue: number = order.amount * share.lastRecordedValue;
        const numberOfOrders: number = Math.floor(orderValue / batchValue) + (orderValue % batchValue > 0 ? 1 : 0);

        const batchSize: number = Math.floor(order.amount / (numberOfOrders));
        const additionToLast: number = order.amount - (numberOfOrders) * batchSize

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
                market: order.market
            }
            orderArray.push(o);
        }

        for (let i = additionToLast - 1; i >= 0; i--) {
            console.log(i % numberOfOrders)
            orderArray[i % numberOfOrders].amount += 1
        }
        
        // orderArray[numberOfOrders - 1].amount += additionToLast

        return orderArray
    }
}