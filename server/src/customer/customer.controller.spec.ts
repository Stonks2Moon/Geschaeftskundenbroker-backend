import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from 'src/company/company.controller';
import { Company } from 'src/company/company.model';
import { CompanyModule } from 'src/company/company.module';
import { CreateCompanyDto } from 'src/company/dto/create-company.dto';
import { Connector } from 'src/util/database/connector';
import { Query } from 'src/util/database/query.model';
import { CustomerController } from './customer.controller';
import { CustomerModule } from './customer.module';
import { CustomerDto } from './dto/customer.dto';
import { LoginDto } from './dto/login.dto';

describe('Test Customer controller', () => {

    let testCustomerController: CustomerController
    let testCompanyController: CompanyController

    const companyDto: CreateCompanyDto = {
        companyName: "Test company from unit-test-2",
        postCode: "68165",
        city: "Mannheim",
        street: "Test street",
        houseNumber: "2"
    }
    let testCompany: Company;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CustomerModule]
        }).compile()

        testCustomerController = module.get<CustomerController>(CustomerController)
    })

    it('Should register a customer and login', async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CompanyModule]
        }).compile()

        testCompanyController = module.get<CompanyController>(CompanyController)

        // Some initialization
        testCompany = await testCompanyController.createCompany(companyDto)

        const registerCustomer: CustomerDto = {
            firstName: "Max-Test",
            lastName: "Muster-Test",
            companyCode: testCompany.companyCode,
            email: "max-muster-test-2@test-mail.com",
            password: "testpassword1234"
        }

        let { customer, session } = await testCustomerController.register(registerCustomer)

        expect(customer).toBeDefined()
        expect(session).toBeDefined()
        expect(customer.email).toEqual(registerCustomer.email)
        expect(customer.customerId).toBeDefined()
        expect(session.customerId).toEqual(customer.customerId)
        expect(session.sessionId).toBeDefined()

        const loginWithSessionDto: LoginDto = {
            session: {
                customerId: customer.customerId,
                sessionId: session.sessionId
            }
        }

        let loginResponse = await testCustomerController.login(loginWithSessionDto)

        expect(loginResponse).toBeDefined()
        expect(loginResponse.customer).toBeDefined()
        expect(loginResponse.session).toBeDefined()
        expect(loginResponse.customer.firstName).toEqual(registerCustomer.firstName)
        expect(loginResponse.customer.lastName).toEqual(registerCustomer.lastName)
        expect(loginResponse.session.customerId).toEqual(customer.customerId)

        const loginWithPasswordDto: LoginDto = {
            login: {
                email: registerCustomer.email,
                password: registerCustomer.password
            }
        }

        loginResponse = await testCustomerController.login(loginWithPasswordDto)

        expect(loginResponse).toBeDefined()
        expect(loginResponse.customer).toBeDefined()
        expect(loginResponse.session).toBeDefined()
        expect(loginResponse.customer.firstName).toEqual(registerCustomer.firstName)
        expect(loginResponse.customer.lastName).toEqual(registerCustomer.lastName)
        expect(loginResponse.session.customerId).toEqual(customer.customerId)

        // Delete test user session
        const deleteUserSessionQuery: Query = {
            query: "DELETE FROM customer_session WHERE session_id = ?",
            args: [
                loginResponse.session.sessionId
            ]
        }

        await Connector.executeQuery(deleteUserSessionQuery)

        // Delete test user
        const deleteUserQuery: Query = {
            query: "DELETE FROM customer WHERE customer_id = ?",
            args: [
                customer.customerId
            ]
        }

        await Connector.executeQuery(deleteUserQuery)

        // Delete test company
        const deleteCompanyQuery: Query = {
            query: "DELETE FROM company WHERE company_id = ?;",
            args: [
                testCompany.companyId
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

    it('Should test the exception cases for customer registration and login', async () => {
        const companyDto: CreateCompanyDto = {
            companyName: "Test company from unit-test-2",
            postCode: "68165",
            city: "Mannheim",
            street: "Test street",
            houseNumber: "2"
        }

        const testCustomerDto: CustomerDto = {
            firstName: "Max-Test",
            lastName: "Muster-Test",
            companyCode: testCompany.companyCode,
            email: "max-muster-test-2@test-mail.com",
            password: "testpassword1234"
        }

        testCompany = await testCompanyController.createCompany(companyDto)
        const testCustomer = await testCustomerController.register(testCustomerDto)
    })
})