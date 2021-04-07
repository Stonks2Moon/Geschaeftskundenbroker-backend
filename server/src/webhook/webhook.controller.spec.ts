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
import { UpdateShares } from "src/util/stock-exchange/share-updates";
import { cleanUp, CleanUpIds } from "src/util/testing/cleanup";

const cryptoRandomString = require('crypto-random-string')

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
        email: `${cryptoRandomString({length: 10, type: 'alphanumeric'})}@test-mail.com`,
        password: "testpassword1234"
    }

    const createDepot: CreateDepotDto = {
        name: "Test Depot for Webhook Tests",
        description: "Ayy lmao",
        session: null
    }

    let testOnPlace = {
        id: cryptoRandomString({ length: 20, type: 'alphanumeric'}),
        jobId: ""
    }

    let testCompany: Company
    let testCustomer: {
        customer: Customer,
        session: CustomerSession
    }
    let testDepot: Depot
    let randomShare: Share
    // let testExchangeOrderId: string


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
            imports: [CompanyModule, CustomerModule, WebhookModule, CustomerModule, ShareModule]
        }).compile()

        webhookController = module.get<WebhookController>(WebhookController)
        depotController = module.get<DepotController>(DepotController)
        companyController = module.get<CompanyController>(CompanyController)
        customerController = module.get<CustomerController>(CustomerController)
        shareController = module.get<ShareController>(ShareController)

        depotService = module.get<DepotService>(DepotService)

    })

    beforeEach(async () => {
       // Register Fake company
       testCompany = await companyController.createCompany(companyDto)
       cleanUpIds.companyIds.push(testCompany.companyId)
       cleanUpIds.addressIds.push(testCompany.addressId)
       registerCustomer.companyCode = testCompany.companyCode

       // Register fake user
       testCustomer = await customerController.register(registerCustomer)
       cleanUpIds.customerIds.push(testCustomer.customer.customerId)
       createDepot.session = testCustomer.session

       // Create fake depot
       testDepot = await depotController.createDepot(createDepot)
       cleanUpIds.depotIds.push(testDepot.depotId)

       // Get a random share id
       randomShare = (await shareController.getAllShares())[0]


       // Fill fake PlaceShareOrder
       testPlaceShareOrder = {
           orderId: cryptoRandomString({length: 10, type: 'alphanumeric'}),
           depotId: testDepot.depotId,
           shareId: randomShare.shareId,
           amount: 10_000,
           detail: "market",
           type: "buy",
           validity: addDays(new Date(), 10)
       }

       // Write the share order to db without using Stock API
       testJob = {
           id: cryptoRandomString({length: 5, type: 'numeric'}),
           placeOrder: {
               amount: testPlaceShareOrder.amount,
               shareId: randomShare.shareId,
               type: testPlaceShareOrder.type,
               onComplete: "",
               onDelete: "",
               onMatch: "",
               onPlace: ""
           }
       } 

       testOnPlace.jobId = testJob.id
    })

    

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

    it('Should delete a job from the DB', async () => {
        await depotService.saveJobs([testJob], testDepot.depotId, [testPlaceShareOrder], CONST.JOB_TYPES.PLACE)
        const localOrderId: string = cryptoRandomString({length: 10, type: 'alphanumeric'})
        await webhookController.onPlace({ id: localOrderId, jobId: testJob.id})

        // const orderId: string = (await Connector.executeQuery({
        //     query: "SELECT * FROM job WHERE job_id = ?;",
        //     args: [testJob.id]
        // }))[0].exchange_order_id
        // console.log("OrderId: ", orderId)

        await webhookController.onDelete({orderId: localOrderId, timestamp: 0, remaining: 0})

        const result = (await Connector.executeQuery({
            query: "SELECT * FROM job WHERE exchange_order_id = ?;",
            args: [localOrderId]
        }))[0]

        expect(result).toBeUndefined()
    })

    it('Should throw an error when deleting a job', async () => {
        await depotService.saveJobs([testJob], testDepot.depotId, [testPlaceShareOrder], CONST.JOB_TYPES.PLACE)
        const localOrderId: string = cryptoRandomString({length: 10, type: 'alphanumeric'})
        await webhookController.onPlace({ id: localOrderId, jobId: testJob.id})

        try {
            await webhookController.onDelete({orderId: localOrderId+1, timestamp: 0, remaining: 0})
            expect(1).toEqual(0)
        } catch(e) {
            expect(e.message).toEqual("Job not found")
        }
    })

    it('It should transform a job into a ShareOrder', async () => {
        let data: OrderCompletedDto = {
            orderId: testOnPlace.id,
            timestamp: (new Date()).getMilliseconds()
        }

        await depotService.saveJobs([testJob], testDepot.depotId, [testPlaceShareOrder], CONST.JOB_TYPES.PLACE)

        await webhookController.onPlace(testOnPlace)

        await webhookController.onComplete(data)

        // Get depot to check if values has changed
        const depot: Depot = await depotController.showDepotById(testDepot.depotId, testCustomer.session)

        expect(depot.summary.totalValue).toBeGreaterThan(0)
        expect(depot.positions.length).toEqual(1)
        expect(depot.positions[0].share.shareId).toEqual(randomShare.shareId)
    })

    it('Should create a UpdateShares instance', () => {
        const updateShares = new UpdateShares()
        expect(updateShares).toBeDefined()
    })

    it('Should run the onMatch callback', () => {
        webhookController.onMatch({
            amount: 0,
            orderId: "",
            price: 0,
            timestamp: 0
        })
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