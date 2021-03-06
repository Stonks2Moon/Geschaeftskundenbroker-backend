import { ApiProperty } from "@nestjs/swagger";

export class CustomerSession {
    @ApiProperty()
    customerId: string;
    @ApiProperty()
    sessionId: string;
}
