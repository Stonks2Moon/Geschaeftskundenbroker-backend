import { Test, TestingModule } from '@nestjs/testing';
import { Connector } from 'src/util/database/connector';
import { Query } from 'src/util/database/query.model';
import { CompanyController } from './company.controller';
import { Company } from './company.model';
import { CompanyModule } from './company.module';
import { CreateCompanyDto } from './dto/create-company.dto';

describe('', () => {

    let testCompanyController: CompanyController
    let testCompanies: Array<Company> = []

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CompanyModule]
        }).compile()

        testCompanyController = module.get<CompanyController>(CompanyController)

        // Some initialization
        testCompanies = await testCompanyController.getAllCompanies()
        if (testCompanies.length <= 0) {
            throw new Error("Could not get test companies from DB");
        }
    })

    it('Should get all companies', async () => {
        const companies: Array<Company> = await testCompanyController.getAllCompanies()

        expect(companies.length).toBeGreaterThanOrEqual(0)
        expect(companies[0]).toBeDefined()
        expect(companies[0].address).toBeDefined()
        expect(companies[0].companyCode.length).toEqual(10)
    })

    it('Should get a company by id', async () => {
        const id = testCompanies[0].companyId
        const company: Company = await testCompanyController.getCompanyById(id)

        expect(company).toBeDefined()
        expect(company.companyId).toEqual(id)
    })

    it('Should get a company by company code', async () => {
        const code = testCompanies[0].companyCode
        const company: Company = await testCompanyController.getCompanyByCode(code)

        expect(company).toBeDefined()
        expect(company.companyCode).toEqual(code)
    })

    it('Should create a company', async () => {
        const companyDto: CreateCompanyDto = {
            companyName: "Test company from unit-test",
            postCode: "68165",
            city: "Mannheim",
            street: "Test street",
            houseNumber: "1"
        }
        const company: Company = await testCompanyController.createCompany(companyDto)

        expect(company).toBeDefined()
        expect(company.companyName).toEqual(companyDto.companyName)
        expect(company.address).toBeDefined()
        expect(company.address.city).toEqual(companyDto.city)

        // Delete test company
        const deleteCompanyQuery: Query = {
            query: "DELETE FROM company WHERE company_id = ?;",
            args: [
                company.companyId
            ]
        }

        await Connector.executeQuery(deleteCompanyQuery)

        // Delete test adress of company
        const deleteAdressQuery: Query = {
            query: "DELETE FROM address WHERE post_code = ? AND city = ? AND street = ? AND house_number = ?;",
            args: [
                companyDto.postCode,
                companyDto.city,
                companyDto.street,
                companyDto.houseNumber
            ]
        }

        await Connector.executeQuery(deleteAdressQuery)
    })
})