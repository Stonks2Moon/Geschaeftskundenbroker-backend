import { Body, Controller, Put } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Company } from './company.model';
import { CompanyService } from './company.service';

@ApiTags('company')
@Controller('company')
export class CompanyController {

    constructor(
        private readonly companyService: CompanyService
    ) { }

    @ApiOkResponse({
        description: "Returns a Company object"
    })
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
