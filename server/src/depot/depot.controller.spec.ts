import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from 'src/company/company.controller';
import { Company } from 'src/company/company.model';
import { CompanyModule } from 'src/company/company.module';
import { CreateCompanyDto } from 'src/company/dto/create-company.dto';
import { CustomerSession } from 'src/customer/customer-session.model';
import { CustomerController } from 'src/customer/customer.controller';
import { Customer } from 'src/customer/customer.model';
import { CustomerModule } from 'src/customer/customer.module';
import { CustomerDto } from 'src/customer/dto/customer.dto';
import { Connector } from 'src/util/database/connector';
import { Query } from 'src/util/database/query.model';
import { DepotController } from './depot.controller';
import { Depot } from './depot.model';
import { DepotModule } from './depot.module';
import { CreateDepotDto } from './dto/create-depot.dto';
import { PlaceShareOrder } from './dto/share-order.dto';

describe('Test Depot controller', () => {

    let testCustomerController: CustomerController
    let testCompanyController: CompanyController
    let testDepotController: DepotController

    const companyDto: CreateCompanyDto = {
        companyName: "Test company from unit-test-3",
        postCode: "68165",
        city: "Mannheim",
        street: "Test street",
        houseNumber: "3"
    }

    let testCompany: Company;
    let testCustomer: {
        customer: Customer,
        session: CustomerSession
    }

    let testDepot: Depot;

    beforeAll(async () => {
        // Some initialization
        const module: TestingModule = await Test.createTestingModule({
            imports: [CompanyModule, CustomerModule]
        }).compile()

        testCompanyController = module.get<CompanyController>(CompanyController)
        testCustomerController = module.get<CustomerController>(CustomerController)
        testCompany = await testCompanyController.createCompany(companyDto)

        const registerCustomer: CustomerDto = {
            firstName: "Max-Test",
            lastName: "Muster-Test",
            companyCode: testCompany.companyCode,
            email: "max-muster-test-3@test-mail.com",
            password: "testpassword1234"
        }

        testCustomer = await testCustomerController.register(registerCustomer)
    })

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [DepotModule]
        }).compile()

        testDepotController = module.get<DepotController>(DepotController)
    })

    it('Should create a depot', async () => {
        const createDepotDto: CreateDepotDto = {
            session: {
                sessionId: testCustomer.session.sessionId,
                customerId: testCustomer.customer.customerId
            },
            name: "Test Depot for unit test",
            description: "Test Depot for unit testing"
        }

        const depot: Depot = await testDepotController.createDepot(createDepotDto)

        expect(depot).toBeDefined()


        // Delete test depot
        const deleteDepotQuery: Query = {
            query: "DELETE FROM depot WHERE depot_id = ?",
            args: [
                depot.depotId
            ]
        }

        await Connector.executeQuery(deleteDepotQuery)

        // // Delete test user session
        // const deleteUserSessionQuery: Query = {
        //     query: "DELETE FROM customer_session WHERE session_id = ?",
        //     args: [
        //         testCustomer.session.sessionId
        //     ]
        // }

        // await Connector.executeQuery(deleteUserSessionQuery)

        // // Delete test user
        // const deleteUserQuery: Query = {
        //     query: "DELETE FROM customer WHERE customer_id = ?",
        //     args: [
        //         testCustomer.customer.customerId
        //     ]
        // }

        // await Connector.executeQuery(deleteUserQuery)

        // // Delete test company
        // const deleteCompanyQuery: Query = {
        //     query: "DELETE FROM company WHERE company_id = ?;",
        //     args: [
        //         testCompany.companyId
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

    it('Should create some depots and list them', async () => {
        let createDepotDtos: Array<CreateDepotDto> = []
        let depots: Array<Depot> = []

        for (let i = 0; i < 5; i++) {
            const createDepotDto: CreateDepotDto = {
                session: {
                    sessionId: testCustomer.session.sessionId,
                    customerId: testCustomer.customer.customerId
                },
                name: `Test Depot for unit test-${i}`,
                description: `Test Depot for unit testing-${i}`
            }

            const depot: Depot = await testDepotController.createDepot(createDepotDto)

            createDepotDtos.push(createDepotDto)
            depots.push(depot)
        }

        expect(depots.length).toEqual(5)
        expect(depots[0]).toBeDefined()
        expect(depots[0].company.companyId).toEqual(testCompany.companyId)

        // const loginCredentials: CustomerSession = {
        //     sessionId: testCustomer.session.sessionId,
        //     customerId: testCustomer.customer.customerId
        // }

        // let depotList: Array<Depot> = await testDepotController.showAllDepots(loginCredentials)

        // expect(depotList).toBeDefined()
        // expect(depotList.length).toEqual(5)
        // expect(depotList[0]).toBeDefined()
        // expect(depotList[0].company.companyName).toEqual(testCompany.companyName)


        // // Delete test depots
        // for (let i = 0; i < depots.length; i++) {
        //     const deleteDepotQuery: Query = {
        //         query: "DELETE FROM depot WHERE depot_id = ?",
        //         args: [
        //             depots[i].depotId
        //         ]
        //     }

        //     await Connector.executeQuery(deleteDepotQuery)
        // }
    })

    it('Should list all depots for the current customer', async () => {
        const depots: Array<Depot> = await testDepotController.showAllDepots(testCustomer.session)

        expect(depots).toBeDefined()
        expect(depots.length).toBeGreaterThan(0)
        for(const d of depots) {
            expect(d.company.companyId).toEqual(testCompany.companyId)
            expect(d.summary.totalValue).toEqual(0)
            expect(d.summary.percentageChange).toEqual(0)
        }

        testDepot = depots[0]
    })

    it('Should get a single depot by id', async () => {
        const depot: Depot = await testDepotController.showDepotById(testDepot.depotId, testCustomer.session)

        expect(depot).toBeDefined()
        expect(depot.company.companyId).toEqual(testCompany.companyId)
        expect(depot.summary.totalValue).toEqual(0)
        expect(depot.summary.percentageChange).toEqual(0)
    })

    it('It should display all (0) pending orders', async () => {
        const pendingOrders: PlaceShareOrder[] = await testDepotController.showPendingOrders(testDepot.depotId, testCustomer.session)

        expect(pendingOrders).toBeDefined()
        expect(pendingOrders.length).toBeGreaterThanOrEqual(0)
    })

    afterAll(async () => {
        // Delete test user session
        const deleteUserSessionQuery: Query = {
            query: "DELETE FROM customer_session WHERE session_id = ?",
            args: [
                testCustomer.session.sessionId
            ]
        }

        await Connector.executeQuery(deleteUserSessionQuery)

        // Delete test user
        const deleteUserQuery: Query = {
            query: "DELETE FROM customer WHERE customer_id = ?",
            args: [
                testCustomer.customer.customerId
            ]
        }

        await Connector.executeQuery(deleteUserQuery)

        // Delete created test depots
        const deleteDepotsQuery: Query = {
            query: "DELETE FROM depot WHERE company_id = ?",
            args: [
                testCompany.companyId
            ]
        }

        await Connector.executeQuery(deleteDepotsQuery)

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
})