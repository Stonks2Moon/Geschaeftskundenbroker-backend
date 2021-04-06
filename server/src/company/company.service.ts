import { Injectable, NotFoundException } from '@nestjs/common'
import { Connector } from 'src/util/database/connector'
import { QueryBuilder } from 'src/util/database/query-builder'
import { Company } from './company.model'
import { Address } from './address.model'
import { v4 as uuid } from 'uuid'
import { CreateCompanyDto } from './dto/create-company.dto'

const cryptoRandomString = require('crypto-random-string')

@Injectable()
export class CompanyService {

    /**
     * Returns a company object for a given company ID
     * @param companyId Company ID
     * @returns a company object
     */
    public async getCompanyById(companyId: string): Promise<Company> {

        let result = (await Connector.executeQuery(QueryBuilder.getCompanyById(companyId)))[0]

        if (!result) {
            throw new NotFoundException("Company not found")
        }

        // Create Address object
        const address: Address = await this.getAddressById(result.address_id)

        const company: Company = {
            companyId: result.company_id,
            companyCode: result.company_code,
            companyName: result.company_name,
            address: address
        }

        return company
    }


    /**
     * Returns a company by it's company code
     * @param companyCode code of company
     * @returns a company object
     */
    public async getCompanyByCompanyCode(companyCode: string): Promise<Company> {
        let result = (await Connector.executeQuery(QueryBuilder.getCompanyByCompanyCode(companyCode)))[0]
        if (!result) {
            throw new NotFoundException("Company not found")
        }

        const company: Company = await this.getCompanyById(result.company_id)
        return company
    }

    /**
     * Creates a company from given data and returns a company object
     * @param company information for company creation
     * @returns a company object
     */
    public async createCompany(company: CreateCompanyDto): Promise<Company> {

        // Create Address object
        const newAddress: Address = {
            postCode: company.postCode,
            city: company.city,
            street: company.street,
            houseNumber: company.houseNumber
        }

        // Generate company uuid
        const companyId: string = uuid()

        // Generate company code
        const companyCode: string = this.generateCompanyCodeFromName(company.companyName)

        // Write Address to DB
        let { insertId } = await Connector.executeQuery(QueryBuilder.createAddress(newAddress))

        // Write company info to DB
        await Connector.executeQuery(QueryBuilder.createCompany({
            companyId: companyId,
            companyCode: companyCode,
            companyName: company.companyName,
            address: null
        }, insertId))

        // Return created company
        return await this.getCompanyById(companyId)
    }


    /**
     * Method used to return all companies (for dropdown in frontend)
     * @returns an array of all companies which use our broker
     */
    public async getAllCompanies(): Promise<Company[]> {
        let result = await Connector.executeQuery(QueryBuilder.getAllCompanies())

        let companies: Company[] = []
        result.forEach(c => {
            companies.push({
                companyId: c.company_id,
                companyCode: c.company_code,
                companyName: c.company_name,
                address: {
                    addressId: c.address_id,
                    postCode: c.post_code,
                    city: c.city,
                    street: c.street,
                    houseNumber: c.house_number
                }
            })
        })

        return companies
    }

    /**
     * Returns an adress by it's address ID
     * @param addressId ID of the address
     * @returns an address object
     */
    public async getAddressById(addressId: string): Promise<Address> {
        let result = (await Connector.executeQuery(QueryBuilder.getAddressById(addressId)))[0]

        if (!result) {
            throw new NotFoundException("Address not found")
        }

        const address: Address = {
            addressId: result.address_id,
            postCode: result.post_code,
            city: result.city,
            street: result.street,
            houseNumber: result.house_number
        }

        return address
    }

    /**
     * Generates a company code from the comapny name
     * @param companyName name of the company
     * @returns a string which is used as company code
     */
    private generateCompanyCodeFromName(companyName: string): string {
        const words: string[] = companyName.split(" ")
        const targetLength = 3
        let code: string = ""

        if (words.length < targetLength) {
            let temp: number = Math.ceil(targetLength / words.length)
            for (let word of words) {
                code += word.slice(0, temp)
            }
            code = code.slice(0, targetLength)
        } else {
            for (let i = 0; i < targetLength; i++) {
                code += words[i].charAt(0)
            }
        }
        if (code.length < targetLength) {
            code = code.padEnd(targetLength, cryptoRandomString({ length: targetLength, type: 'alphanumeric' }).slice(0, targetLength))
        }

        return `${code.toUpperCase()}#${cryptoRandomString({ length: 6, type: 'alphanumeric' }).toUpperCase()}`
    }
}
