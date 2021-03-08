import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { CustomerSession } from "src/customer/customer-session.model";

export class CreateDepotDto {
    @ApiProperty()
    @ValidateNested()
    @Type(() => CustomerSession)
    session: CustomerSession;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    description: string;
}