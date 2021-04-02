import { BadRequestException, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { CustomerSession } from 'src/customer/customer-session.model';
import { Depot } from './depot.model';
import { CreateDepotDto } from './dto/create-depot.dto';
import { PlaceOrderDto } from './dto/place-order.dto';
import { PlaceShareOrder } from './dto/share-order.dto';
import { Job } from "moonstonks-boersenapi";
import { CustomerService } from 'src/customer/customer.service';
import { Customer } from 'src/customer/customer.model';
import { CompanyService } from 'src/company/company.service';
import { uuid } from 'uuidv4';
import { Connector } from 'src/util/database/connector';
import { QueryBuilder } from 'src/util/database/query-builder';
import { Company } from 'src/company/company.model';
import { Share } from 'src/share/share.model';
import { DepotSummary, DepotEntry, DepotPosition } from './dto/depot-entry.dto';
import { ShareService } from 'src/share/share.service';
import { executeApiCall, getOrderFunction, marketManager, orderManager } from '../util/stock-exchange/stock-wrapper'
import * as StaticConsts from "../util/static-consts";
import { TradeAlgorithm } from 'src/util/stock-exchange/trade-algorithm';

@Injectable()
export class DepotService {

    constructor(
        private readonly customerService: CustomerService,
        private readonly companyService: CompanyService,
        private readonly shareService: ShareService
    ) { }

    /**
     * Creates a depot with the provided depot info
     * @param createDepot Depot Info
     * @returns Returns the created Depot 
     */
    public async createDepot(createDepot: CreateDepotDto): Promise<Depot> {
        // Validate Session
        const customer: { customer: Customer, session: CustomerSession } = await this.customerService.customerLogin({ session: createDepot.session })

        // Check input
        if (!createDepot.name || createDepot.name === "") {
            throw new BadRequestException("Invalid name")
        }

        // Get company from customer
        const companyId: string = customer.customer.company.companyId

        // Generate DepotId
        const depotId: string = uuid()

        // Create Depot
        await Connector.executeQuery(QueryBuilder.createDepot(depotId, companyId, createDepot.name, createDepot.description))

        // Get and return created depot
        return await this.showDepotById(depotId, customer.session)
    }

    /**
     * Method to place an order, this also handles the algoritmic trading
     * @param placeOrder placeOrder object with all needed information to perform task
     * @returns TODO
     */
    public async placeOrder(placeOrder: PlaceOrderDto): Promise<Array<PlaceShareOrder>> {

        // Validate Session
        const customer: { customer: Customer, session: CustomerSession } = await this.customerService.customerLogin({ session: placeOrder.customerSession })

        // Get relevant share
        const share: Share = await this.shareService.getShareData(placeOrder.order.shareId);

        // Check if market is open or not
        const isClosed: boolean = await executeApiCall<boolean>(marketManager.isClosed, [], marketManager)
        if (isClosed) {
            throw new NotAcceptableException("Could not place order, the market is closed");
        }

        // Check if algorithm applies
        let orderArray: Array<PlaceShareOrder> = [];
        switch (placeOrder.tradeAlgorithm) {
            case 1:
                if (placeOrder.order.amount * share.lastRecordedValue < StaticConsts.ALG_SPLIT_THRESHOLD) {
                    throw new BadRequestException("Doesn't fulfill requirement")
                }
                orderArray = await TradeAlgorithm.splitBuyOrderInSmallerOrders(placeOrder.order)
                break

            default:
                orderArray.push(placeOrder.order)
        }

        let results: Array<Job> = []
        for (const o of orderArray) {
            const orderFunction = getOrderFunction(o);
            results.push(await executeApiCall<Job>(orderFunction.func.f, orderFunction.args, orderManager));
        }

        await this.saveJobs(results, placeOrder.order.depotId, orderArray)

        // TODO: Order auf DB anlegen
        // Irgendwas mit Jobs machen (speichern oder so -> GENAU)
        console.log(results)
        return orderArray;
    }


    /**
     * Returns a list of all depots associated with the customers company
     * @param customerSession A Valid Customer Session object 
     * @returns Returns an array of all depots associated with the customer's company and a summary of each depot
     */
    public async showAllDepots(customerSession: CustomerSession): Promise<Array<Depot>> {
        // Validate Session
        const customer: { customer: Customer, session: CustomerSession } = await this.customerService.customerLogin({ session: customerSession })

        // get depots for company
        let depots: Depot[] = await this.getDepotsByCompanyId(customer.customer.company)


        // For each depot, get depot positions and summarize them (by share)
        for (let d of depots) {
            const pos: DepotPosition[] = await this.getDepotPositions(d.depotId)
            d.summary = this.depotSummaryFromPositions(pos)
        }

        // Return depot infos + summary
        return depots
    }


    /**
     * Returns an array of depots associated with a company
     * @param company Company object
     * @returns Returns an array of depots associated with the company
     */
    private async getDepotsByCompanyId(company: Company): Promise<Depot[]> {
        // Get depot by company id from DB
        const results = await Connector.executeQuery(QueryBuilder.getDepotByCompanyId(company.companyId))

        // Generate depot objects
        let depots: Depot[] = []
        results.forEach(d => {
            depots.push({
                company: company,
                depotId: d.depot_id,
                name: d.name,
                description: d.description
            })
        })

        return depots;
    }

    /**
     * Summarizes an array of depot positions 
     * @param positions An array of DepotPosition
     * @returns Returns an DepotSummary object
     */
    private depotSummaryFromPositions(positions: DepotPosition[]): DepotSummary {
        // Aggregation Variables
        let totalCostValue: number = 0
        let totalCurrentValue: number = 0
        let percentageChange: number = 0

        // Aggregate cost values and current values
        positions.forEach(p => {
            totalCostValue += p.costValue
            totalCurrentValue += p.currentValue
        })

        // Calculate percentage change 
        percentageChange = 100 * ((totalCurrentValue - totalCostValue) / totalCostValue)

        // Create depot summary object
        const depotSummary: DepotSummary = {
            totalValue: totalCurrentValue,
            percentageChange: percentageChange
        }

        return depotSummary
    }

    /**
     * Get all depot positions (by share) for a depot
     * @param depotId Id of the depot
     * @returns Returns an array of DepotPosition objects
     */
    private async getDepotPositions(depotId: string): Promise<DepotPosition[]> {
        const results = await Connector.executeQuery(QueryBuilder.getDepotEntriesByDepotId(depotId))

        let depotEntries: DepotEntry[] = []
        let shares: Share[] = []

        // Get all shares for positions, avoid duplicates
        for (const e of results) {
            if (!this.shareService.shareIdInShareArray(e.share_id, shares)) {
                shares.push(await this.shareService.getShareData(e.share_id))
            }

            depotEntries.push({
                depotId: depotId,
                amount: e.amount,
                costValue: e.cost_value,
                share: (shares.filter(s => { return e.share_id === s.shareId }))[0]
            })
        }

        // Summarize to DepotPosition
        let depotPositions: DepotPosition[] = []

        // For each share, summarize the DepotPositions
        for (const s of shares) {
            // Aggregation Variables
            let totalAmount: number = 0
            let totalCostValue: number = 0
            let totalCurrentValue: number = 0
            let percentageChange: number = 0

            // Aggregate the positions for current share
            for (const e of depotEntries.filter(e => { return e.share.shareId === s.shareId })) {
                totalAmount += e.amount
                totalCostValue += e.costValue
            }

            totalCurrentValue = totalAmount * s.lastRecordedValue
            percentageChange = 100 * ((totalCurrentValue - totalCostValue) / totalCostValue)

            // Append DepotPosition to positions array
            depotPositions.push({
                amount: totalAmount,
                costValue: totalCostValue,
                currentValue: totalCurrentValue,
                percentageChange: percentageChange,
                depotId: depotId,
                share: s
            })
        }

        return depotPositions
    }

    /**
     * Returns a Depot object without positions and summary
     * @param depotId Id of the depot
     * @param company Optional company argument to void additional DB call
     * @returns Returns an Depot Object
     */
    private async getDepotById(depotId: string, company?: Company): Promise<Depot> {

        // Get depot from DB
        const result = (await Connector.executeQuery(QueryBuilder.getDepotById(depotId)))[0]

        // Throw exception if depot not found
        if (!result) {
            throw new NotFoundException("Depot now found")
        }

        const depot: Depot = {
            depotId: depotId,
            name: result.name,
            description: result.description,
            company: null
        }

        // Use optional company argument
        if (!company) {
            depot.company = await this.companyService.getCompanyById(result.company_id)
        } else {
            depot.company = company
        }

        return depot
    }

    /**
     * Creates a detailed Depot object (with summary and positions)
     * @param depotId Id of the depot
     * @param customerSession Valid CustomerSession as Authorization object
     * @returns Returns a Depot object
     */
    public async showDepotById(depotId: string, customerSession: CustomerSession): Promise<Depot> {
        // Validate Session
        const customer: { customer: Customer, session: CustomerSession } = await this.customerService.customerLogin({ session: customerSession })

        let depot: Depot = await this.getDepotById(depotId)
        depot.positions = await this.getDepotPositions(depotId)
        depot.summary = this.depotSummaryFromPositions(depot.positions)

        return depot
    }


    public async getJobById(info: {
        jobId?: string,
        orderId?: string
    }): Promise<Job> {
        const result = (await Connector.executeQuery(QueryBuilder.getJobById(info)))

        // const job: Job = {

        // }
        return null
    }

    
    /**
     * Method to write the Jobs wich are returned from stock-exchange to our db, 
     * @param jobs Array of jobs from stock-exchange
     * @param depotId depotId of user
     * @param orders Array of orders (from algorithm)
     */
    private async saveJobs(jobs: Job[], depotId: string, orders: PlaceShareOrder[]): Promise<void> {
        if (jobs.length != orders.length) {
            throw new InternalServerErrorException("Jobs / Orders length mismatch")
        }

        for (let i = 0; i < jobs.length; i++) {
            await Connector.executeQuery(QueryBuilder.writeJobToDb(jobs[i], depotId, orders[i]))
        }
    }
}
