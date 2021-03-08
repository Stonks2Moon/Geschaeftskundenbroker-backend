import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCompanyDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    companyName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    postCode: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    city: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    street: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    houseNumber: string;
}