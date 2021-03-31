import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Company } from './company.model';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@ApiTags('company')
@Controller('company')
export class CompanyController {
    constructor(
        private readonly companyService: CompanyService
    ) { }

    @ApiCreatedResponse({
        description: "Returns a Company object",
        type: Company
    })
    @ApiBody({
        description: "Create a company", type: CreateCompanyDto
    })
    @Put()
    async createCompany(
        @Body() company: CreateCompanyDto
    ): Promise<Company> {
        return await this.companyService.createCompany(company);
    }

    @ApiOkResponse({
        description: "Returns a Company object",
        type: Company
    })
    @Get('code/:companyCode')
    async getCompanyByCode(
        @Param('companyCode') companyCode: string
    ): Promise<Company> {
        return await this.companyService.getCompanyByCompanyCode(companyCode);
    }


    @ApiOkResponse({
        description: "Returns a Company object",
        type: Company
    })
    @Get('id/:companyId')
    async getCompanyById(
        @Param('companyId') companyId: string
    ): Promise<Company> {
        return await this.companyService.getCompanyById(companyId);
    }

    @ApiOkResponse({
        description: "Returns an array of all companies, sorted alphabetically by name.",
        isArray: true,
        type: Company
    })
    @Get('all')
    async getAllCompanies(): Promise<Company[]> {
        return await this.companyService.getAllCompanies();

    }
}
