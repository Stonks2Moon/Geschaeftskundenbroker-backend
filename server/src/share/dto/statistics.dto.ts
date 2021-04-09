import { ApiProperty } from "@nestjs/swagger"

export class Statistics {
    @ApiProperty()
    difference: number

    @ApiProperty()
    percent: number
}
