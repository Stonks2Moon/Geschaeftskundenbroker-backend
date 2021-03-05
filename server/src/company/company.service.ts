import { Injectable, NotFoundException } from '@nestjs/common';
import { Connector } from 'src/util/database/connector';
import { QueryBuilder } from 'src/util/database/query-builder';
import { Company } from './company.model';
import { Address } from './address.model';
import { uuid } from 'uuidv4';


const cryptoRandomString = require('crypto-random-string');

@Injectable()
export class CompanyService {

    public async getCompanyById(companyId: string): Promise<Company> {
        
        let result = (await Connector.executeQuery(QueryBuilder.getCompanyById(companyId)))[0];
        
        if(!result) {
            throw new NotFoundException("Company not found");
        }

        // Create Address object
        const address: Address = await this.getAddressById(result.address_id);

        const company: Company = {
            companyId: result.company_id,
            companyCode: result.company_code, 
            companyName: result.company_name,
            address: address
        }

        return company;
    }


    public async getCompanyByCompanyCode(companyCode: string): Promise<Company> {
        let result = (await Connector.executeQuery(QueryBuilder.getCompanyByCompanyCode(companyCode)))[0];
        if(!result) {
            throw new NotFoundException("Company not found");
        }

        const company: Company = await this.getCompanyById(result.company_id);
        return company;
    }

    public async createCompany(company: {
        companyName: string,
        postCode: string,
        city: string,
        street: string,
        houseNumber: string
    }): Promise<Company> {
        
        // Create Address object
        const newAddress: Address = {
            postCode: company.postCode,
            city: company.city,
            street: company.street,
            houseNumber: company.houseNumber
        }

        // Generate company uuid
        const companyId: string = uuid();

        // Generate company code


        return null;
    }


    public generateCompanyIdFromName(companyName: string): string {
        const words: string[] = companyName.split(" ");
        const targetLength = 3;
        let code: string = "";

        if(words.length < targetLength) {
            let temp: number = Math.ceil(targetLength / words.length);
            for(let word in words) {
                code += word.slice(0, temp);
            }
            code = code.slice(0, targetLength);
        } else {
            for(let i = 0; i < targetLength; i++) {
                code += words[i].charAt(0);
            }
        }
        return `${code}#${cryptoRandomString({length: 6, type: 'alphanumeric'}).toUpperCase()}`
    }


    public async getAddressById(addressId: string): Promise<Address> {
        let result = (await Connector.executeQuery(QueryBuilder.getAddressById(addressId)))[0];

        if(!result) {
            throw new NotFoundException("Address not found");
        }
        
        const address: Address = {
            postCode: result.post_code,
            city: result.city,
            street: result.street,
            houseNumber: result.house_number
        }

        return address;
    }
}
