import { Body, Controller, Put, Type } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Company } from './company.model';
import { CompanyService } from './company.service';



@ApiTags('company')
@Controller('company')
export class CompanyController {
    constructor(
        private readonly companyService: CompanyService
    ) { }

    @ApiOkResponse({
        description: "Returns a Company object",
        type: Company
    })
    @ApiBody({
        description: ""
    })
    @Put()
    async createCompany(
        @Body('company') company: {
            companyName: string;
            postCode: string
            city: string,
            street: string,
            houseNumber: string
        }): Promise<Company> {
        return await this.companyService.createCompany(company);
    }
}
