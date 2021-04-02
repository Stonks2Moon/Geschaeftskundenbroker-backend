import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsOptional, ValidateNested } from "class-validator"
import { CustomerSession } from "../customer-session.model"
import { LoginInputDto } from "./login-input.dto"

export class LoginDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => LoginInputDto)
    login?: LoginInputDto

    @ApiProperty({ required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => CustomerSession)
    session?: CustomerSession
}