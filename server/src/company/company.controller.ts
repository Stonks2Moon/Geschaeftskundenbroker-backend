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

    /**
     * Used to create a company
     * @param company company dto with all information needed for creation
     * @returns a company object
     */
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

    /**
     * Used to get a company by it's companycode
     * @param companyCode code of the company
     * @returns a company object
     */
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


    /**
     * Used to get a company by it's ID
     * @param companyId id of the company
     * @returns a company object
     */
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

    /**
     * Used to get all companies which use our broker (for frontend dropdown in registration)
     * @returns an array of all company objects
     */
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
