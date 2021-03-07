import { ApiProperty } from "@nestjs/swagger";
import { CustomerSession } from "src/customer/customer-session.model";
import { PlaceShareOrder } from "./share-order.dto";

export class PlaceOrderDto {
    @ApiProperty()
    customerSession: CustomerSession;

    @ApiProperty()
    order: PlaceShareOrder;
}