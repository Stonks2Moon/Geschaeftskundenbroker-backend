import { ApiProperty } from "@nestjs/swagger";
import { Company } from "src/company/company.model";
import { DepotEntrySummary } from "./dto/depot-entry-summary.dto";

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
    summary?: DepotEntrySummary;
}