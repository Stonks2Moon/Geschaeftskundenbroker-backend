import { ApiProperty } from "@nestjs/swagger";

export class Address {
    @ApiProperty({ required: false })
    addressId?: string;

    @ApiProperty()
    postCode: string;

    @ApiProperty()
    city: string;

    @ApiProperty()
    street: string;

    @ApiProperty()
    houseNumber: string;
}