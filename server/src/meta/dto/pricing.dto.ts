import { ApiProperty } from "@nestjs/swagger"

class PriceDetails {
    @ApiProperty()
    changeoverLimit: number

    @ApiProperty()
    fixum: number
    
    @ApiProperty()
    tradePromille: number

    @ApiProperty()
    tradeMin: number

    @ApiProperty()
    tradeMax: number

    @ApiProperty()
    transactionMin: number

    @ApiProperty()
    transactionMax: number

    @ApiProperty()
    transactionPromille: number
}

export class StockExchangePricing {
    @ApiProperty({
        type: PriceDetails,
        isArray: true
    })
    entries: Array<PriceDetails>

    @ApiProperty()
    type: string
}