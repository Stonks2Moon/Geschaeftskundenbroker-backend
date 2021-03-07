import { ApiProperty, ApiTags } from "@nestjs/swagger";

export class CustomerDto {
    @ApiProperty()
    firstName: string;
    @ApiProperty()
    lastName: string;
    @ApiProperty()
    email: string;
    @ApiProperty()
    password: string;
    @ApiProperty()
    companyCode: string;
}