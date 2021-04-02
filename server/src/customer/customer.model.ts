import { ApiProperty } from "@nestjs/swagger";
import { Company } from "src/company/company.model";

// Modell eines Nutzers
export class Customer {
    @ApiProperty({ required: false })
    customerId?: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    email: string;

    @ApiProperty({ required: false })
    company?: Company;

    @ApiProperty({ required: true })
    password?: string;

    @ApiProperty({ required: false })
    companyCode?: string;
}