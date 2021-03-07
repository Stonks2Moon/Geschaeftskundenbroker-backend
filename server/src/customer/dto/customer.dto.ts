import { ApiProperty, ApiTags } from "@nestjs/swagger";

export class CustomerDto {
    

    firstName

    lastName

    email

    password

    companyCode

    constructor(firstName, lastName, email, password, companyCode) {}
}