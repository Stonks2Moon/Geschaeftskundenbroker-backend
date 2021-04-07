import { Test, TestingModule } from '@nestjs/testing';
import { Connector } from 'src/util/database/connector';
import { Query } from 'src/util/database/query.model';
import { cleanUp, CleanUpIds } from 'src/util/testing/cleanup';
import { CompanyController } from './company.controller';
import { Company } from './company.model';
import { CompanyModule } from './company.module';
import { CreateCompanyDto } from './dto/create-company.dto';

describe('Test Company controller', () => {

    let testCompanyController: CompanyController
    let testCompanies: Array<Company> = []
    let testCompany: Company

    let cleanUpIds: CleanUpIds = {
        customerIds: [],
        depotIds: [],
        companyIds: [],
        addressIds: [],
        shareIds: []
    }

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

        // Create a test company
        testCompany = await testCompanyController.createCompany({
            city: "Mannheim",
            companyName: "Company Unit Tests",
            houseNumber: "69",
            postCode: "12345",
            street: "Keinestr."
        })
        cleanUpIds.companyIds.push(testCompany.companyId)
        cleanUpIds.addressIds.push(testCompany.addressId)
    })

    it('Should get all companies', async () => {
        const companies: Array<Company> = await testCompanyController.getAllCompanies()

        expect(companies.length).toBeGreaterThanOrEqual(1)
        expect(companies[0]).toBeDefined()
        expect(companies[0].address).toBeDefined()
        expect(companies[0].companyCode.length).toEqual(10)
    })

    it('Should get a company by id', async () => {
        const id = testCompany.companyId
        const company: Company = await testCompanyController.getCompanyById(id)

        expect(company).toBeDefined()
        expect(company.companyId).toEqual(id)
        expect(company.companyName).toEqual(testCompany.companyName)
    })

    it('Should get a company by company code', async () => {
        const code = testCompany.companyCode
        const company: Company = await testCompanyController.getCompanyByCode(code)

        expect(company).toBeDefined()
        expect(company.companyCode).toEqual(code)
        expect(company.companyName).toEqual(testCompany.companyName)
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
        cleanUpIds.companyIds.push(company.companyId)
        cleanUpIds.addressIds.push(company.addressId)

        expect(company).toBeDefined()
        expect(company.companyName).toEqual(companyDto.companyName)
        expect(company.address).toBeDefined()
        expect(company.address.city).toEqual(companyDto.city)

        // // Delete test company
        // const deleteCompanyQuery: Query = {
        //     query: "DELETE FROM company WHERE company_id = ?;",
        //     args: [
        //         company.companyId
        //     ]
        // }

        // await Connector.executeQuery(deleteCompanyQuery)

        // // Delete test adress of company
        // const deleteAdressQuery: Query = {
        //     query: "DELETE FROM address WHERE post_code = ? AND city = ? AND street = ? AND house_number = ?;",
        //     args: [
        //         companyDto.postCode,
        //         companyDto.city,
        //         companyDto.street,
        //         companyDto.houseNumber
        //     ]
        // }

        // await Connector.executeQuery(deleteAdressQuery)
    })

    it('Should create a company with a short name', async () => {
        const companyDto: CreateCompanyDto = {
            companyName: "A",
            postCode: "68165",
            city: "Mannheim",
            street: "Test street",
            houseNumber: "1"
        }

        const company: Company = await testCompanyController.createCompany(companyDto)
        cleanUpIds.companyIds.push(company.companyId)
        cleanUpIds.addressIds.push(company.addressId)

        expect(company).toBeDefined()
        expect(company.companyName).toEqual(companyDto.companyName)
        expect(company.address).toBeDefined()
        expect(company.address.city).toEqual(companyDto.city)

        // // Delete test company
        // await Connector.executeQuery({
        //     query: "DELETE FROM company WHERE company_id = ?;",
        //     args: [
        //         company.companyId
        //     ]
        // })

        // // Delete the address
        // await Connector.executeQuery({
        //     query: "DELETE FROM address WHERE address_id = ?",
        //     args: [
        //         company.address.addressId
        //     ]
        // })
    })

    it('Should test company exception cases', async () => {
        // Get a company with an unknown id 
        try {
            await testCompanyController.getCompanyById("not_a_real_company_id")
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Company not found")
        }

        // Get a company with an unknown code 
        try {
            await testCompanyController.getCompanyByCode("not_a_real_company_code")
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Company not found")
        }
    })

    afterEach(async () => {
        await cleanUp(cleanUpIds)
        cleanUpIds = {
            customerIds: [],
            depotIds: [],
            companyIds: [],
            addressIds: [],
            shareIds: []
        }
    })
})