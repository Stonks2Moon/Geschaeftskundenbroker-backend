import { ApiProduces, ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { Job } from "moonstonks-boersenapi"
import { Share } from "src/share/share.model"
import { orderDetails, orderTypes } from "src/util/stock-exchange/stock-wrapper"
export class JobWrapper extends Job {
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
}