import { ApiProperty } from "@nestjs/swagger"

export class Address {
    @ApiProperty({ required: false })
    addressId?: number

    @ApiProperty()
    postCode: string

    @ApiProperty()
    city: string

    @ApiProperty()
    street: string

    @ApiProperty()
    houseNumber: string
}