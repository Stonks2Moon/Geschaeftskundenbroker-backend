import { ApiProperty } from "@nestjs/swagger";
import { CustomerSession } from "src/customer/customer-session.model";
import { Order } from "../order.model";

export class PlaceOrderDto {
    @ApiProperty()
    customerSession: CustomerSession;

    @ApiProperty()
    order: Order
}