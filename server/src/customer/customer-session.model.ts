import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty } from "class-validator"

export class CustomerSession {
    @ApiProperty()
    @IsNotEmpty()
    customerId: string

    @ApiProperty()
    @IsNotEmpty()
    sessionId: string
}
