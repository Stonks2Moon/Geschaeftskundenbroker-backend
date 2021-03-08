import { ApiProperty } from "@nestjs/swagger";

export class Share {
    @ApiProperty()
    shareId?: number;

    @ApiProperty()
    shareName: string;

    @ApiProperty()
    isin: string;

    @ApiProperty()
    wkn: string;

    @ApiProperty()
    lastRecordedValue: number;

    @ApiProperty()
    currencyCode: string;

    @ApiProperty()
    currencyName: string;
}