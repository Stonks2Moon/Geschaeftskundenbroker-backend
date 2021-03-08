import { ApiProperty } from "@nestjs/swagger";
import { Company } from "src/company/company.model";
import { DepotPosition, DepotSummary } from "./dto/depot-entry.dto";

export class Depot {
    @ApiProperty()
    depotId: string;

    @ApiProperty()
    company: Company;

    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty({required: false})
    summary?: DepotSummary;

    @ApiProperty({required: false})
    positions?: DepotPosition[]
}