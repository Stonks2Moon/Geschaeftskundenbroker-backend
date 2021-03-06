import { ApiProperty } from "@nestjs/swagger";
import { Company } from "src/company/company.model";

// Modell eines Nutzers
export class Customer {
    @ApiProperty()
    customerId?: string;
    @ApiProperty()
    firstName: string;
    @ApiProperty()
    lastName: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    company?: Company;
    @ApiProperty()
    password?: string;
    @ApiProperty()
    companyCode?: string;
}