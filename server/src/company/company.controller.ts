import { Body, Controller, Put } from '@nestjs/common';
import { Company } from './company.model';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {

    constructor(
        private readonly companyService: CompanyService
    ) {}

    @Put()
    async createCompany(
        @Body('company') company: {
        companyName: string,
        postCode: string,
        city: string,
        street: string,
        houseNumber: string
    }): Promise<Company> {
        return await this.companyService.createCompany(company);
    }
}
