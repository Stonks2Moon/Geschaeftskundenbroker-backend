import { ApiProperty } from '@nestjs/swagger'
import { Address } from './address.model'

export class Company {
    @ApiProperty()
    companyId: string

    @ApiProperty()
    companyCode: string

    @ApiProperty()
    companyName: string

    @ApiProperty()
    address: Address

    @ApiProperty()
    addressId?: number
}