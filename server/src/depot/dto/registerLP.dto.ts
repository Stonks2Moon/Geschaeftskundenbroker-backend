import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNotEmpty, IsString, Min, ValidateNested } from "class-validator"
import { CustomerSession } from "src/customer/customer-session.model"

export class RegisterLpDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    depotId: string

    @ApiProperty()
    @ValidateNested()
    @Type(() => CustomerSession)
    customerSession: CustomerSession

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    shareId: string

    @ApiProperty()
    @Min(0.001)
    lqQuote: number
}