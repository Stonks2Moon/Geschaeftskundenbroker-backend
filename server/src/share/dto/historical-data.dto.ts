import { ApiProperty } from "@nestjs/swagger";
import { Share } from "../share.model";

export class ChartValue {
    @ApiProperty()
    timestamp: Date;

    @ApiProperty()
    value: number
}

export class HistoricalDataDto {
    @ApiProperty({type: Share})
    share: Share;

    @ApiProperty({
        type: ChartValue,
        isArray: true
    })
    chartValues: Array<ChartValue>
}