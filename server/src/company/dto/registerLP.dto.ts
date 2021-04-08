import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNotEmpty, IsString, Min, ValidateNested } from "class-validator"
import { isMainThread } from "node:worker_threads"
import { CustomerSession } from "src/customer/customer-session.model"

export class RegisterLpDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    companyId: string

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
    quote: number

}