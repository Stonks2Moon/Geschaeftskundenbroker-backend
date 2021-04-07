import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from 'src/company/company.controller';
import { Company } from 'src/company/company.model';
import { CompanyModule } from 'src/company/company.module';
import { CreateCompanyDto } from 'src/company/dto/create-company.dto';
import { Connector } from 'src/util/database/connector';
import { Query } from 'src/util/database/query.model';
import { cleanUp, CleanUpIds } from 'src/util/testing/cleanup';
import { CustomerSession } from './customer-session.model';
import { CustomerController } from './customer.controller';
import { Customer } from './customer.model';
import { CustomerModule } from './customer.module';
import { CustomerDto } from './dto/customer.dto';
import { LoginDto } from './dto/login.dto';

const cryptoRandomString = require('crypto-random-string')

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

    const registerCustomer: CustomerDto = {
        firstName: "Max-Test",
        lastName: "Muster-Test",
        companyCode: "",
        email: `max-muster-test-${cryptoRandomString({length: 10, type: 'alphanumeric'})}@test-mail.com`,
        password: "testpassword1234"
    }

    let testCompany: Company;

    // let testCustomerId: string
    // let testCompanyId: string
    // let testAddressId: number

    let testCustomer: {
        customer: Customer,
        session: CustomerSession
    }

    let cleanUpIds: CleanUpIds = {
        customerIds: [],
        depotIds: [],
        companyIds: [],
        addressIds: [],
        shareIds: []
    }


    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CustomerModule, CompanyModule]
        }).compile()

        testCustomerController = module.get<CustomerController>(CustomerController)
        testCompanyController = module.get<CompanyController>(CompanyController)

        // Some initialization
        testCompany = await testCompanyController.createCompany(companyDto)
        cleanUpIds.companyIds.push(testCompany.companyId)
        cleanUpIds.addressIds.push(testCompany.addressId)

        // testCompanyId = testCompany.companyId
        // testAddressId = testCompany.addressId

        registerCustomer.companyCode = testCompany.companyCode

        testCustomer = await testCustomerController.register(registerCustomer)
        cleanUpIds.customerIds.push(testCustomer.customer.customerId)
    })


    it('Should register a customer and login', async () => {
        const testCustomerCreateDto: CustomerDto = {
            companyCode: testCompany.companyCode,
            email: `max-muster-test-${cryptoRandomString({length: 10, type: 'alphanumeric'})}@test-mail.com`,
            firstName: "Max",
            lastName: "Muster",
            password: "hello_world"
        }
        
        let { customer, session } = await testCustomerController.register(testCustomerCreateDto)
        cleanUpIds.customerIds.push(customer.customerId)

        expect(customer).toBeDefined()
        expect(session).toBeDefined()
        expect(customer.email).toEqual(testCustomerCreateDto.email)
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
        expect(loginResponse.customer.firstName).toEqual(testCustomerCreateDto.firstName)
        expect(loginResponse.customer.lastName).toEqual(testCustomerCreateDto.lastName)
        expect(loginResponse.session.customerId).toEqual(customer.customerId)

        const loginWithPasswordDto: LoginDto = {
            login: {
                email: testCustomerCreateDto.email,
                password: testCustomerCreateDto.password
            }
        }

        loginResponse = await testCustomerController.login(loginWithPasswordDto)

        expect(loginResponse).toBeDefined()
        expect(loginResponse.customer).toBeDefined()
        expect(loginResponse.session).toBeDefined()
        expect(loginResponse.customer.firstName).toEqual(testCustomerCreateDto.firstName)
        expect(loginResponse.customer.lastName).toEqual(testCustomerCreateDto.lastName)
        expect(loginResponse.session.customerId).toEqual(customer.customerId)
    })

    it('Should test the exception cases for customer registration and login', async () => {
        const companyDto: CreateCompanyDto = {
            companyName: "Test company from unit-test-2",
            postCode: "68165",
            city: "Mannheim",
            street: "Test street",
            houseNumber: "2"
        }

        testCompany = await testCompanyController.createCompany(companyDto)
        cleanUpIds.companyIds.push(testCompany.companyId)
        cleanUpIds.addressIds.push(testCompany.addressId)

        const testCustomerDto: CustomerDto = {
            firstName: "Max-Test",
            lastName: "Muster-Test",
            companyCode: testCompany.companyCode,
            email: "max-muster-test-2@test-mail.com",
            password: "testpassword1234"
        }

        testCustomer = await testCustomerController.register(testCustomerDto)
        cleanUpIds.customerIds.push(testCustomer.customer.customerId)

        const alreadyEmail: CustomerDto = {
            firstName: "Max-Test",
            lastName: "Muster-Test",
            companyCode: testCompany.companyCode,
            email: "max-muster-test-2@test-mail.com",
            password: "testpassword1234"
        }

        const invalidEmail: CustomerDto = {
            firstName: "Max-Test",
            lastName: "Muster-Test",
            companyCode: testCompany.companyCode,
            email: "test",
            password: "testpassword1234"
        }

        const invalidName1: CustomerDto = {
            firstName: "Max-Test0",
            lastName: "Muster-Test",
            companyCode: testCompany.companyCode,
            email: "max-muster-test-29312@test-mail.com",
            password: "testpassword1234"
        }

        const invalidName2: CustomerDto = {
            firstName: "Max-Test",
            lastName: "Muster-Test0",
            companyCode: testCompany.companyCode,
            email: "max-muster-test-01733@test-mail.com",
            password: "testpassword1234"
        }

        const invalidCompanyCode: CustomerDto = {
            firstName: "Max-Test",
            lastName: "Muster-Test",
            companyCode: "Hello World",
            email: "max-muster-test-103759@test-mail.com",
            password: "testpassword1234"
        }

        try {
            await testCustomerController.register(alreadyEmail)
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Email Address already registered")
        }

        try {
            await testCustomerController.register(invalidEmail)
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Invalid Email Address")
        }

        try {
            await testCustomerController.register(invalidName1)
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Invalid first or last name")
        }

        try {
            await testCustomerController.register(invalidName2)
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Invalid first or last name")
        }

        try {
            await testCustomerController.register(invalidCompanyCode)
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Invalid Company Code")
        }

 
        const getCustomer: Customer = await testCustomerController.getCustomer(testCustomer.customer.customerId, testCustomer.session)
        expect(getCustomer).toBeDefined()
        expect(getCustomer.customerId).toEqual(testCustomer.customer.customerId)
        expect(getCustomer.email).toEqual(testCustomerDto.email)

        try {
            await testCustomerController.getCustomer("no such user id", null)
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Customer not found")
        }

        try {
            await testCustomerController.getCustomer(testCustomer.customer.customerId, {
                customerId: testCustomer.customer.customerId,
                sessionId: testCustomer.session.sessionId + "1"
            })
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Not authorized")
        }

        try {
            await testCustomerController.getCustomer(testCustomer.customer.customerId, {
                customerId: testCustomer.customer.customerId + "1",
                sessionId: testCustomer.session.sessionId
            })
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Not authorized")
        }

        const result = (await Connector.executeQuery({
            query: "SELECT * FROM customer WHERE customer_id != ?",
            args: [
                testCustomer.customer.customerId
            ]
        }))[0]

        try {
            await testCustomerController.getCustomer(result.customer_id, {
                customerId: testCustomer.customer.customerId,
                sessionId: testCustomer.session.sessionId
            })
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Invalid Session")
        }
    })

    it('Should test invalid login parameters', async () => {
        const companyDto: CreateCompanyDto = {
            companyName: "Test company from unit test login",
            postCode: "68165",
            city: "Mannheim",
            street: "Test street",
            houseNumber: "69"
        }

        testCompany = await testCompanyController.createCompany(companyDto)
        cleanUpIds.companyIds.push(testCompany.companyId)
        cleanUpIds.addressIds.push(testCompany.addressId)

        const testCustomerDto: CustomerDto = {
            firstName: "Max-Test",
            lastName: "Muster-Test",
            companyCode: testCompany.companyCode,
            email: "max-muster-test-91783@test-mail.com",
            password: "testpassword1234"
        }

        testCustomer = await testCustomerController.register(testCustomerDto)
        cleanUpIds.customerIds.push(testCustomer.customer.customerId)
        
        
        try {
            await testCustomerController.login({login: {
                email: testCustomerDto.email,
                password: testCustomerDto.password + "1"
            }})
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Not authorized")
        }

        try {
            await testCustomerController.login({login: {
                email: testCustomerDto.email + "1",
                password: testCustomerDto.password
            }})
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Not authorized")
        }

        try {
            await testCustomerController.login({session: {
                customerId: testCustomer.session.customerId + "1",
                sessionId: testCustomer.session.sessionId
            }})
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Not authorized")
        }

        try {
            await testCustomerController.login({session: {
                customerId: testCustomer.session.customerId,
                sessionId: testCustomer.session.sessionId + "1"
            }})
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Not authorized")
        }

        try {
            await testCustomerController.login({})
            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual("Insufficient authorization arguments")
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