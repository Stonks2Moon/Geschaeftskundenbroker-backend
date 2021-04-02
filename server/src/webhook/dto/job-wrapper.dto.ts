import { Job } from "moonstonks-boersenapi";
import { Share } from "src/share/share.model";

export class JobWrapper extends Job {
    depotId: string
    share: Share
    detail: 'market' | 'limit' | 'stop' | 'stopLimit'
    exchangeOrderId: string
    orderValidity: Date
    jobType: 'buy' | 'sell'

    market?: string
}