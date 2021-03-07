import { ApiProperty } from "@nestjs/swagger";

export class CreateCompanyDto {
    @ApiProperty()
    companyName: string;

    @ApiProperty()
    postCode: string;

    @ApiProperty()
    city: string;

    @ApiProperty()
    street: string;
    
    @ApiProperty()
    houseNumber: string;

}