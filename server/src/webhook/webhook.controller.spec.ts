import { Test, TestingModule } from "@nestjs/testing";
import { CompanyController } from "src/company/company.controller";
import { Company } from "src/company/company.model";
import { CompanyModule } from "src/company/company.module";
import { CreateCompanyDto } from "src/company/dto/create-company.dto";
import { CustomerSession } from "src/customer/customer-session.model";
import { CustomerController } from "src/customer/customer.controller";
import { Customer } from "src/customer/customer.model";
import { CustomerModule } from "src/customer/customer.module";
import { CustomerDto } from "src/customer/dto/customer.dto";
import { DepotController } from "src/depot/depot.controller";
import { Depot } from "src/depot/depot.model";
import { CreateDepotDto } from "src/depot/dto/create-depot.dto";
import { PlaceShareOrder } from "src/depot/dto/share-order.dto";
import { ShareModule } from "src/share/share.module";
import { ShareController } from "src/share/share.controller"
import { JobWrapper } from "./dto/job-wrapper.dto";
import { WebhookController } from "./webhook.controller"
import { WebhookModule } from "./webhook.module";
import { Share } from "src/share/share.model";
import { addDays } from "../util/cron/cron-jobs"
import { Job, OrderCompletedDto } from "moonstonks-boersenapi";
import { DepotService } from "src/depot/depot.service";
import * as CONST from "../util/const"
import { Connector } from "src/util/database/connector";

describe('Test Depot controller', () => {

    // Test Controller
    let webhookController: WebhookController
    let depotController: DepotController
    let companyController: CompanyController
    let customerController: CustomerController
    let shareController: ShareController

    // Test Services
    let depotService: DepotService

    
    let testJob: Job
    let testPlaceShareOrder: PlaceShareOrder

    const companyDto: CreateCompanyDto = {
        companyName: "Test company from unit-test-3",
        postCode: "68165",
        city: "Mannheim",
        street: "Test street",
        houseNumber: "3"
    }

    const registerCustomer: CustomerDto = {
        firstName: "Max-Test",
        lastName: "Muster-Test",
        companyCode: "",
        email: "max-muster-test-3@test-mail.com",
        password: "testpassword1234"
    }

    const createDepot: CreateDepotDto = {
        name: "Test Depot for Webhook Tests",
        description: "Ayy lmao",
        session: null
    }

    let testOnPlace = {
        id: "New_exchange_order_id",
        jobId: ""
    }

    let testCompany: Company
    let testCustomer: {
        customer: Customer,
        session: CustomerSession
    }
    let testDepot: Depot
    let testShare: Share

    beforeAll(async () => {
        // Some initialization
        const module: TestingModule = await Test.createTestingModule({
            imports: [CompanyModule, CustomerModule, WebhookModule, CustomerModule, ShareModule]
        }).compile()

        webhookController = module.get<WebhookController>(WebhookController)
        depotController = module.get<DepotController>(DepotController)
        companyController = module.get<CompanyController>(CompanyController)
        customerController = module.get<CustomerController>(CustomerController)
        shareController = module.get<ShareController>(ShareController)

        depotService = module.get<DepotService>(DepotService)

        // Register Fake company
        testCompany = await companyController.createCompany(companyDto)
        registerCustomer.companyCode = testCompany.companyCode

        // Register fake user
        testCustomer = await customerController.register(registerCustomer)
        createDepot.session = testCustomer.session

        // Create fake depot
        testDepot = await depotController.createDepot(createDepot)

        // Get a random share id
        testShare = (await shareController.getAllShares())[0]


        // Fill fake PlaceShareOrder
        testPlaceShareOrder = {
            orderId: "",
            depotId: testDepot.depotId,
            shareId: testShare.shareId,
            amount: 10_000,
            detail: "market",
            type: "buy",
            validity: addDays(new Date(), 10)
        }

        // Write the share order to db without using Stock API
        testJob = {
            id: "1",
            placeOrder: {
                amount: testPlaceShareOrder.amount,
                shareId: testShare.shareId,
                type: testPlaceShareOrder.type,
                onComplete: "",
                onDelete: "",
                onMatch: "",
                onPlace: ""
            }
        } 

        testOnPlace.jobId = testJob.id
    })

    // beforeEach(async () => {
       
    // })

    

    it('It should set the exchange order id of a job', async () => {
        await depotService.saveJobs([testJob], testDepot.depotId, [testPlaceShareOrder], CONST.JOB_TYPES.PLACE)

        await webhookController.onPlace(testOnPlace)

        const result = (await Connector.executeQuery({
            query: "SELECT * FROM job WHERE job_id = ?;",
            args: [testJob.id]
        }))[0]

        expect(result).toBeDefined()
        expect(result.exchange_order_id).toEqual(testOnPlace.id)
    })

    it('It should transform a job into a ShareOrder', async () => {
        let data: OrderCompletedDto = {
            orderId: testOnPlace.id,
            timestamp: (new Date()).getMilliseconds()
        }

        await webhookController.onComplete(data)

        // Get depot to check if values has changed
        const depot: Depot = await depotController.showDepotById(testDepot.depotId, testCustomer.session)

        expect(depot.summary.totalValue).toBeGreaterThan(0)
        expect(depot.positions.length).toEqual(1)
        expect(depot.positions[0].share.shareId).toEqual(testShare.shareId)
    })


    afterAll(async () => {
        // Delete all Test Data

        // Delete share_order
        await Connector.executeQuery({
            query: "DELETE FROM share_order WHERE depot_id = ?;",
            args: [
                testDepot.depotId
            ]
        })

        // Delete depot_entry
        await Connector.executeQuery({
            query: "DELETE FROM depot_entry WHERE depot_id = ?;",
            args: [
                testDepot.depotId
            ]
        })

        // Delete job
        await Connector.executeQuery({
            query: "DELETE FROM job WHERE job_id = ?;",
            args: [
                testJob.id
            ]
        })

        // Delete depot
        await Connector.executeQuery({
            query: "DELETE FROM depot WHERE depot_id = ?;",
            args: [
                testDepot.depotId
            ]
        })

        // Delete customer session
        await Connector.executeQuery({
            query: "DELETE FROM customer_session WHERE customer_id = ?;",
            args: [
                testCustomer.customer.customerId
            ]
        })

        // Delete customer
        await Connector.executeQuery({
            query: "DELETE FROM customer WHERE customer_id = ?;",
            args: [
                testCustomer.customer.customerId
            ]
        })

        // Delete company
        await Connector.executeQuery({
            query: "DELETE FROM company WHERE company_id = ?;",
            args: [
                testCompany.companyId
            ]
        })
    })
})