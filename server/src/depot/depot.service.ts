import { BadRequestException, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException, NotImplementedException } from '@nestjs/common';
import { CustomerSession } from 'src/customer/customer-session.model';
import { Depot } from './depot.model';
import { CreateDepotDto } from './dto/create-depot.dto';
import { PlaceOrderDto } from './dto/place-order.dto';
import { ReturnShareOrder } from './dto/share-order.dto';
import { BörsenAPI, Job, OrderManager } from "moonstonks-boersenapi";
import { MarketManager } from "moonstonks-boersenapi"
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

@Injectable()
export class DepotService {

    private stockExchangeApi = new BörsenAPI('moonstonks token');
    private orderManager = new OrderManager(this.stockExchangeApi, 'onPlace', 'onMatch', 'onComplete', 'onDelete');

    constructor(
        private readonly customerService: CustomerService,
        private readonly companyService: CompanyService,
        private readonly shareService: ShareService
    ) { }

    // private stockApi: BörsenAPI = new BörsenAPI('moonstonks token', 'onMatch', 'onComplete', 'onDelete');

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

    public async placeOrder(placeOrder: PlaceOrderDto): Promise<ReturnShareOrder> {

        // Validate Session
        const customer: { customer: Customer, session: CustomerSession } = await this.customerService.customerLogin({ session: placeOrder.customerSession })

        // Check if market is open or not (Queue order if is closed or throw error?)
        // if (await MarketManager.isClosed()) {
        //     throw new NotAcceptableException("Could not place order, the market is closed");
        // }

        const orderFunctions = new Map([
            ["market buy", {
                f: this.orderManager.placeBuyMarketOrder,
                args: ["shareId", "amount"]
            }],
            ["market sell", {
                f: this.orderManager.placeSellMarketOrder,
                args: ["shareId", "amount"]
            }],

            ["limit buy", {
                f: this.orderManager.placeBuyLimitOrder,
                args: ["shareId", "amount", "limit"]
            }],
            ["limit sell", {
                f: this.orderManager.placeSellLimitOrder,
                args: ["shareId", "amount", "limit"]
            }],

            ["stop buy", {
                f: this.orderManager.placeBuyStopMarketOrder,
                args: ["shareId", "amount", "stop"]
            }],
            ["stop sell", {
                f: this.orderManager.placeSellStopLimitOrder,
                args: ["shareId", "amount", "stop"]
            }],

            ["stopLimit buy", {
                f: this.orderManager.placeBuyStopLimitOrder,
                args: ["shareId", "amount", "limit", "stop"]
            }],
            ["stopLimit sell", {
                f: this.orderManager.placeSellStopLimitOrder,
                args: ["shareId", "amount", "limit", "stop"]
            }],
        ]);

        let orderFunction = orderFunctions.get(`${placeOrder.order.detail} ${placeOrder.order.type}`);
        let result: Job;

        console.log(orderFunction.args.map(key => placeOrder.order[key]))

        try {
            result = await orderFunction.f.apply(this.orderManager, orderFunction.args.map(key => placeOrder.order[key]))
        } catch (error) {
            throw new InternalServerErrorException(error);
        }

        // switch (placeOrder.order.detail) {
        //     case "market":
        //         if (placeOrder.order.type == "buy") {

        //         } else if (placeOrder.order.type == "sell") {

        //         }
        //         break;
        //     case "limit":
        //         if (placeOrder.order.type == "buy") {

        //         } else if (placeOrder.order.type == "sell") {

        //         }
        //         break;
        //     case "stop":
        //         if (placeOrder.order.type == "buy") {

        //         } else if (placeOrder.order.type == "sell") {

        //         }
        //         break;
        //     case "stopLimit":
        //         if (placeOrder.order.type == "buy") {

        //         } else if (placeOrder.order.type == "sell") {

        //         }
        //         break;

        // }

        throw new NotImplementedException()
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
}
