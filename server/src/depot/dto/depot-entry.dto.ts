import { ApiProperty } from "@nestjs/swagger";
import { Share } from "src/share/share.model";

export class DepotEntry {
    @ApiProperty()
    depotId: string

    @ApiProperty()
    share: Share

    @ApiProperty()
    amount: number

    @ApiProperty()
    costValue: number
}

export class DepotPosition extends DepotEntry {
    @ApiProperty()
    currentValue: number

    @ApiProperty()
    percentageChange: number

}

export class DepotSummary {
    @ApiProperty()
    totalValue: number

    @ApiProperty()
    percentageChange: number
}

export class ReturnDepotEntry extends DepotEntry {
    @ApiProperty()
    entryId: string

    @ApiProperty()
    createdAt: Date
}