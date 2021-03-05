import { Address } from './address.model'

export interface Company {
    companyId: string,
    companyCode: string,
    companyName: string,
    address: Address,
    addressId?: number
}