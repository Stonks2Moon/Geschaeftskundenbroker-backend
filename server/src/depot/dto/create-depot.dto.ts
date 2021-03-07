import { ApiProperty } from "@nestjs/swagger";
import { CustomerSession } from "src/customer/customer-session.model";

export class CreateDepotDto {
    @ApiProperty()
    session: CustomerSession;

    @ApiProperty()
    name: string;

    @ApiProperty({required: false})
    description: string;
}