import { ApiProperty } from "@nestjs/swagger"
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
import { Share } from "src/share/share.model"
import { orderDetails, orderTypes } from "src/util/stock-exchange/stock-wrapper"


abstract class ShareOrder {
    orderId: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    depotId: string

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    amount: number

    @ApiProperty({ enum: orderTypes })
    @IsNotEmpty()
    @IsEnum(orderTypes)
    type: 'buy' | 'sell'

    @ApiProperty({ enum: orderDetails })
    @IsNotEmpty()
    @IsEnum(orderDetails)
    detail: 'market' | 'limit' | 'stop' | 'stopLimit'

    @ApiProperty()
    @IsDateString()
    validity: Date

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    limit?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    stop?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    stopLimit?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    market?: string
}

export class PlaceShareOrder extends ShareOrder {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    shareId: string
}

export class ReturnShareOrder extends ShareOrder {
    @ApiProperty({ required: false })
    orderId: string

    @ApiProperty({ required: false })
    share?: Share 
    
    @ApiProperty({ required: false })
    costValue?: number
}