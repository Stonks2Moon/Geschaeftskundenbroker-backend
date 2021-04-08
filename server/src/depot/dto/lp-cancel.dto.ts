import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNotEmpty, IsNumber, ValidateNested } from "class-validator"
import { CustomerSession } from "src/customer/customer-session.model"

export class LpCancelDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    lpId: number

    @ApiProperty()
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => CustomerSession)
    customerSession: CustomerSession
}