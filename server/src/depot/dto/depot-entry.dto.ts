import { ApiProperty } from "@nestjs/swagger";
import { Share } from "src/share/share.model";

abstract class DepotEntry {
    @ApiProperty()
    depotId: string;

    @ApiProperty()
    share: Share;

    @ApiProperty()
    amount: number;

    @ApiProperty()
    costValue: number;
}

export class DepotEntrySummaryPosition extends DepotEntry {
    @ApiProperty()
    currentValue: number;

    @ApiProperty()
    percentageChange: number;
}

export class ReturnDepotEntry extends DepotEntry {
    @ApiProperty()
    entryId: string;

    @ApiProperty()
    createdAt: Date;
}