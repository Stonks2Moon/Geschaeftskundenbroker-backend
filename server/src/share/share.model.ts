import { ApiProperty } from "@nestjs/swagger"

export class Share {
    @ApiProperty()
    shareId?: string

    @ApiProperty()
    shareName: string

    @ApiProperty()
    isin: string

    @ApiProperty()
    wkn: string

    @ApiProperty()
    lastRecordedValue: number

    @ApiProperty()
    currencyCode: string

    @ApiProperty()
    currencyName: string
}