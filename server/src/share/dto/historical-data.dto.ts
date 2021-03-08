import { ApiProperty } from "@nestjs/swagger";
import { Share } from "../share.model";

export class ChartValue {
    @ApiProperty()
    recordedAt: Date;

    @ApiProperty()
    recordedValue: number
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