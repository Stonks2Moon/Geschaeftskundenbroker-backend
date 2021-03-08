import { ApiProperty, ApiTags } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CustomerDto {
    

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    firstName: string

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    lastName: string

    @ApiProperty()
    @IsEmail()
    email: string

    @ApiProperty()
    @IsNotEmpty()
    password: string

    @ApiProperty()
    @IsNotEmpty()
    companyCode: string

}