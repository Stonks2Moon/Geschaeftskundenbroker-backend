import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'moonstonks-boersenapi';
import { CompanyController } from 'src/company/company.controller';
import { Company } from 'src/company/company.model';
import { CompanyModule } from 'src/company/company.module';
import { CreateCompanyDto } from 'src/company/dto/create-company.dto';
import { CustomerSession } from 'src/customer/customer-session.model';
import { CustomerController } from 'src/customer/customer.controller';
import { Customer } from 'src/customer/customer.model';
import { CustomerModule } from 'src/customer/customer.module';
import { CustomerDto } from 'src/customer/dto/customer.dto';
import { ShareController } from 'src/share/share.controller';
import { Share } from 'src/share/share.model';
import { ShareModule } from 'src/share/share.module';
import { addDays } from 'src/util/cron/cron-jobs.service';
import { Connector } from 'src/util/database/connector';
import { CleanUpIds, cleanUp } from 'src/util/testing/cleanup';
import { JobWrapper } from 'src/webhook/dto/job-wrapper.dto';
import { WebhookController } from 'src/webhook/webhook.controller';
import { WebhookModule } from 'src/webhook/webhook.module';
import { DepotController } from './depot.controller';
import { Depot } from './depot.model';
import { DepotModule } from './depot.module';
import { DepotService } from './depot.service';
import { CreateDepotDto } from './dto/create-depot.dto';
import { PlaceShareOrder } from './dto/share-order.dto';

const cryptoRandomString = require('crypto-random-string')

describe('Test Depot controller', () => {

    let testCustomerController: CustomerController
    let testCompanyController: CompanyController
    let testDepotController: DepotController
    let testShareController: ShareController
    let testWebHookController: WebhookController

    let testDepotService: DepotService

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

    let randomShare: Share

    let cleanUpIds: CleanUpIds = {
        customerIds: [],
        depotIds: [],
        companyIds: [],
        addressIds: [],
        shareIds: []
    }

    beforeAll(async () => {
        // Some initialization
        const module: TestingModule = await Test.createTestingModule({
            imports: [CompanyModule, CustomerModule, ShareModule, WebhookModule]
        }).compile()

        testCompanyController = module.get<CompanyController>(CompanyController)
        testCustomerController = module.get<CustomerController>(CustomerController)
        testShareController = module.get<ShareController>(ShareController)
        testWebHookController = module.get<WebhookController>(WebhookController)
    })

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [DepotModule]
        }).compile()

        testDepotController = module.get<DepotController>(DepotController)
        testDepotService = module.get<DepotService>(DepotService)

        testCompany = await testCompanyController.createCompany(companyDto)
        cleanUpIds.companyIds.push(testCompany.companyId)
        cleanUpIds.addressIds.push(testCompany.addressId)

        const registerCustomer: CustomerDto = {
            firstName: "Max-Test",
            lastName: "Muster-Test",
            companyCode: testCompany.companyCode,
            email: `${cryptoRandomString({length: 10, type: 'alphanumeric'})}@test-mail.com`,
            password: "testpassword1234"
        }

        testCustomer = await testCustomerController.register(registerCustomer)
        cleanUpIds.customerIds.push(testCustomer.customer.customerId)

        testDepot = await testDepotController.createDepot({
            session: {
                sessionId: testCustomer.session.sessionId,
                customerId: testCustomer.customer.customerId
            },
            name: "Test Depot for unit test",
            description: "Test Depot for unit testing"
        })
        cleanUpIds.depotIds.push(testDepot.depotId)

        randomShare = (await testShareController.getAllShares())[0]
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
        cleanUpIds.depotIds.push(depot.depotId)

        expect(depot).toBeDefined()

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
            cleanUpIds.depotIds.push(depot.depotId)
            
            createDepotDtos.push(createDepotDto)
            depots.push(depot)
        }

        expect(depots.length).toEqual(5)
        expect(depots[0]).toBeDefined()
        expect(depots[0].company.companyId).toEqual(testCompany.companyId)

    })

    it('Should list all depots for the current customer', async () => {
        // Create 5 depots
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
            cleanUpIds.depotIds.push(depot.depotId)
        }

        const depots: Array<Depot> = await testDepotController.showAllDepots(testCustomer.session)

        expect(depots).toBeDefined()
        expect(depots.length).toBeGreaterThan(0)
        for(const d of depots) {
            expect(d.company.companyId).toEqual(testCompany.companyId)
            expect(d.summary.totalValue).toEqual(0)
            expect(d.summary.percentageChange).toEqual(0)
        }
    })

    it('Should get a single depot by id', async () => {
        const depot: Depot = await testDepotController.showDepotById(testDepot.depotId, testCustomer.session)

        expect(depot).toBeDefined()
        expect(depot.company.companyId).toEqual(testCompany.companyId)
        expect(depot.summary.totalValue).toEqual(0)
        expect(depot.summary.percentageChange).toEqual(0)
    })

    it('It should display all (0) pending orders', async () => {       
        const pendingOrders: JobWrapper[] = await testDepotController.showPendingOrders(testDepot.depotId, testCustomer.session)

        expect(pendingOrders).toBeDefined()
        expect(pendingOrders.length).toBeGreaterThanOrEqual(0)
    })

    it('Should test exception cases of the depot controller', async () => {
        // Create fake company
        const exceptionComp: CreateCompanyDto = {
            companyName: "Test company for depot exception tests",
            postCode: "68165",
            city: "Mannheim",
            street: "Test street",
            houseNumber: "4"
        }

        testCompany = await testCompanyController.createCompany(exceptionComp)
        cleanUpIds.companyIds.push(testCompany.companyId)
        cleanUpIds.addressIds.push(testCompany.addressId)

        // Create fake customer
        const exceptionCust: CustomerDto = {
            firstName: "Exception",
            lastName: "Tester",
            companyCode: testCompany.companyCode,
            email: `${cryptoRandomString({length: 10, type: 'alphanumeric'})}@test-mail.com`,
            password: "testpassword1234"
        }

        testCustomer = await testCustomerController.register(exceptionCust)
        cleanUpIds.customerIds.push(testCustomer.customer.customerId)

        // Create fake depot
        const exceptionDepot: CreateDepotDto = {
            description: "Exception test Depot",
            name: "Exception Test",
            session: testCustomer.session
        }

        testDepot = await testDepotController.createDepot(exceptionDepot)
        cleanUpIds.depotIds.push(testDepot.depotId)

        // Create a depot with invalid name
        try {
            await testDepotController.createDepot({
                description: "Exception test Depot",
                name: "",
                session: testCustomer.session
            })
            expect(0).toEqual(1)
        } catch (e) {
            expect(e.message).toEqual("Invalid name")
        }
    })

    it('Should test some depot exception cases', async () => {
        // Use invalid depot id
        try {
            await testDepotController.showDepotById("not_a_real_depot_id", testCustomer.session)
            expect(1).toEqual(0)
        } catch (e) {
            expect(e.message).toEqual("Depot not found")
        }

        // Illegal call to saveJobs
        let jobs: Job[] = [
            { id: "" },
            { id: "" }
        ]

        let orders: PlaceShareOrder[] = [
            { amount: 0, depotId: "", detail: 'limit', orderId: "", shareId: "", type: 'buy', validity: null}
        ]
        try{
            // await testDepotService.saveJob(jobs, "", orders, "")
            // expect(0).toEqual(1)
        } catch (e) {
            // expect(e.message).toEqual("Jobs / Orders length mismatch")
        }

        // Illegal depot access attempt
        let diffDepotId: string
        try {
            diffDepotId = (await Connector.executeQuery({query: "SELECT * FROM depot WHERE depot_id != ?;", args: [testDepot.depotId]}))[0].depot_id

            await testDepotController.showPendingOrders(diffDepotId, testCustomer.session)

            expect(0).toEqual(1)
        } catch(e) {
            expect(e.message).toEqual(`Customer with id ${testCustomer.customer.customerId} is not allowed to access depot with id ${diffDepotId}`)
        }

        

        // Create a second test company
        let testCompany2 = await testCompanyController.createCompany({
            companyName: "Test company from unit-test-3#2",
            postCode: "68165",
            city: "Mannheim",
            street: "Test street",
            houseNumber: "3"
        })
        cleanUpIds.companyIds.push(testCompany2.companyId)
        cleanUpIds.addressIds.push(testCompany2.addressId)


        // Create a second test customer
        let testCustomer2 = await testCustomerController.register({
            firstName: "Max-Test",
            lastName: "Muster-Test",
            companyCode: testCompany2.companyCode,
            email: `${cryptoRandomString({length: 10, type: 'alphanumeric'})}@test-mail.com`,
            password: "testpassword1234"
        })
        cleanUpIds.customerIds.push(testCustomer2.customer.customerId)

        //Create a second test depot
        let testDepot2: Depot = await testDepotController.createDepot({
            session: {
                sessionId: testCustomer2.session.sessionId,
                customerId: testCustomer2.customer.customerId
            },
            name: "Test Depot for unit test",
            description: "Test Depot for unit testing"
        })
        cleanUpIds.depotIds.push(testDepot2.depotId)

        // Place order on depot 2
        let orderId: string = cryptoRandomString({length: 20, type: "alphanumeric"})
        let jobId: number = cryptoRandomString({length: 9, type: "numeric"})
        jobs = [
            { id: `${jobId}`, placeOrder: {amount: 0, onComplete: "", onDelete: "", onMatch: "", onPlace: "", shareId: randomShare.shareId, type: 'buy', limit: 0, stop: 0} }
        ]

        orders = [
            { amount: 0, depotId: testDepot2.depotId, detail: 'limit', orderId: orderId, shareId: randomShare.shareId, type: 'buy', validity: addDays(new Date(), 10), limit: 0, market: "", stop: 0, stopLimit: 0}
        ]

        await testDepotService.saveJob(jobs[0], testDepot2.depotId, orders[0], "place")
        
        let pendingOrders: JobWrapper[] = await testDepotController.showPendingOrders(testDepot2.depotId, testCustomer2.session)

        expect(pendingOrders).toBeDefined()
        expect(pendingOrders.length).toEqual(1)

        await testWebHookController.onPlace({jobId: jobId, id: orderId })

        try {
            await testDepotController.deletePendingOrder(orderId, testCustomer.session)
            expect(0).toEqual(1)
        } catch (e) {
            expect(e.message).toEqual(`Customer with id ${testCustomer.customer.customerId} is not allowed to access depot with id ${testDepot2.depotId}`)
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