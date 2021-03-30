import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, ValidateNested } from "class-validator";
import { CustomerSession } from "src/customer/customer-session.model";
import { PlaceShareOrder } from "./share-order.dto";

export class PlaceOrderDto {
    @ApiProperty()
    @ValidateNested()
    @Type(() => CustomerSession)
    customerSession: CustomerSession;

    @ApiProperty()
    @ValidateNested()
    @Type(() => PlaceShareOrder)
    order: PlaceShareOrder;

    @ApiProperty()
    @IsOptional()
    tradeAlgorithm: number
}