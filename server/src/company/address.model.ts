import { ApiProperty } from "@nestjs/swagger";

export class Address {
    @ApiProperty()
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