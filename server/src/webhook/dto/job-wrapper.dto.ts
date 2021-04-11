import { ApiProduces, ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { Share } from "src/share/share.model"
import { orderDetails, orderTypes } from "src/util/stock-exchange/stock-wrapper"
class JobPlaceOrder {
    @ApiProperty()
    shareId: string

    @ApiProperty()
    amount: number

    @ApiProperty()
    onPlace: string

    @ApiProperty()
    onMatch: string

    @ApiProperty()
    onComplete: string

    @ApiProperty()
    onDelete: string;

    @ApiProperty({ enum: orderTypes })
    type: 'buy' | 'sell'

    @ApiProperty()
    limit?: number

    @ApiProperty()
    stop?: number
}
class JobDeleteOrder {
    @ApiProperty()
    orderId: string
}
export class MyJob {
    @ApiProperty()
    id: string;

    @ApiProperty({type: JobPlaceOrder})
    placeOrder?: JobPlaceOrder;

    @ApiProperty({type: JobDeleteOrder})
    deleteOrder?: JobDeleteOrder;
}

export class JobWrapper extends MyJob {
    @ApiProperty()
    depotId: string

    @ApiProperty()
    @Type(() => Share)
    share: Share

    @ApiProperty({ enum: orderDetails })
    detail: 'market' | 'limit' | 'stop' | 'stopLimit'

    @ApiProperty()
    exchangeOrderId: string

    @ApiProperty()
    orderValidity: Date

    @ApiProperty({ enum: orderTypes })
    jobType: 'buy' | 'sell'

    @ApiProperty()
    market?: string

    @ApiProperty()
    isLpJob?: boolean

    @ApiProperty()
    costValue?: number

    @ApiProperty()
    isLp?: boolean
}