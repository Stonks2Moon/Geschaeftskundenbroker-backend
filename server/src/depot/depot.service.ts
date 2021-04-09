import { BadRequestException, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { CustomerSession } from 'src/customer/customer-session.model'
import { Depot } from './depot.model'
import { CreateDepotDto } from './dto/create-depot.dto'
import { PlaceOrderDto } from './dto/place-order.dto'
import { PlaceShareOrder, ReturnShareOrder } from './dto/share-order.dto'
import { Job } from "moonstonks-boersenapi"
import { CustomerService } from 'src/customer/customer.service'
import { Customer } from 'src/customer/customer.model'
import { CompanyService } from 'src/company/company.service'
import { v4 as uuid } from 'uuid'
import { Connector } from 'src/util/database/connector'
import { QueryBuilder } from 'src/util/database/query-builder'
import { Company } from 'src/company/company.model'
import { Share } from 'src/share/share.model'
import { DepotSummary, DepotEntry, DepotPosition } from './dto/depot-entry.dto'
import { ShareService } from 'src/share/share.service'
import { executeApiCall, getOrderFunction, marketManager, orderManager } from '../util/stock-exchange/stock-wrapper'
import { TradeAlgorithm } from 'src/util/stock-exchange/trade-algorithm'
import * as CONST from "../util/const"
import { JobWrapper } from 'src/webhook/dto/job-wrapper.dto'
import { RegisterLpDto } from './dto/lp-register.dto'
import { LpPosition } from './dto/lp-position.dto'
import { LpCancelDto } from './dto/lp-cancel.dto'
import { Query } from 'src/util/database/query.model'


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
     * Method to place an order, this also handles the algorithmic trading
     * @param placeOrder placeOrder object with all needed information to perform task
     * @returns the placed order if successful else throw an error
     */
    public async placeOrder(placeOrder: PlaceOrderDto, isCron = false): Promise<Array<PlaceShareOrder>> {
        let isLp: boolean
        if (isCron) {
            isLp = true
        } else {
            // Get from db if user is lp,
        }

        let customer: { customer: Customer, session: CustomerSession }
        let depot: Depot
        // Validate Session if input is from user
        if (!isCron) {
            customer = await this.customerService.customerLogin({ session: placeOrder.customerSession })

            // Validate if customer is authorized to order on this depot
            depot = await this.showDepotById(placeOrder.order.depotId, placeOrder.customerSession)
            if (depot.company.companyId != customer.customer.company.companyId) {
                throw new UnauthorizedException(`Customer with id ${customer.customer.customerId} is not allowed to access depot with id ${depot.depotId}`)
            }
        }

        // Check if customer has enough shares to sell
        if (placeOrder.order.type === CONST.ORDER.TYPE.SELL) {
            // Check if given share is in customers depot
            const pos = depot.positions.filter((p) => {
                return p.share.shareId === placeOrder.order.shareId
            })[0]

            // If customer does not have the given share or not enough throw error
            if (!pos || pos.amount < placeOrder.order.amount) {
                throw new UnprocessableEntityException(`Customer with id ${customer.customer.customerId} has not enough shares with id ${placeOrder.order.shareId} to sell`)
            }
        }

        // Get relevant share
        const share: Share = await this.shareService.getShareData(placeOrder.order.shareId)

        // Check if market is open or not
        const isClosed: boolean = await executeApiCall<boolean>(marketManager.isClosed, [], marketManager)
        if (isClosed) {
            throw new NotAcceptableException("Could not place order, the market is closed")
        }

        // Check if algorithm applies
        let orderArray: Array<PlaceShareOrder> = []
        switch (placeOrder.tradeAlgorithm) {
            case 1:
                if (placeOrder.order.amount * share.lastRecordedValue < CONST.ALG_SPLIT_THRESHOLD) {
                    throw new BadRequestException("Doesn't fulfill requirement")
                }
                orderArray = await TradeAlgorithm.splitBuyOrderInSmallerOrders(placeOrder.order)
                break

            default:
                orderArray.push(placeOrder.order)
        }

        let results: Array<Job> = []
        for (const o of orderArray) {
            const orderFunction = getOrderFunction(o)
            results.push(await executeApiCall<Job>(orderFunction.func.f, orderFunction.args, orderManager))
        }

        await this.saveJobs(results, placeOrder.order.depotId, orderArray, CONST.JOB_TYPES.PLACE)

        return orderArray
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

        return depots
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


        // Calculate percentage change (avoid division by 0)
        percentageChange = totalCostValue > 0 ? 100 * ((totalCurrentValue - totalCostValue) / totalCostValue) : 0

        // Create depot summary object
        const depotSummary: DepotSummary = {
            totalValue: Math.round(totalCurrentValue * 100) / 100,
            percentageChange: Math.round(percentageChange * 100) / 100
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
                costValue: Math.round(totalCostValue * 100) / 100,
                currentValue: Math.round(totalCurrentValue * 100) / 100,
                percentageChange: Math.round(percentageChange * 100) / 100,
                profit: Math.round((totalCurrentValue - totalCostValue) * 100) / 100,
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
    private async getDepotById(depotId: string): Promise<Depot> {

        // Get depot from DB
        const result = (await Connector.executeQuery(QueryBuilder.getDepotById(depotId)))[0]

        // Throw exception if depot not found
        if (!result) {
            throw new NotFoundException("Depot not found")
        }

        const depot: Depot = {
            depotId: depotId,
            name: result.name,
            description: result.description,
            company: null
        }


        depot.company = await this.companyService.getCompanyById(result.company_id)

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

    /**
     * Saves a share order object to DB
     * @param order share order object
     * @returns the created share order object
     */
    public async saveShareOrder(order: PlaceShareOrder): Promise<PlaceShareOrder> {

        // Get share by it's id
        const share = (await this.shareService.getShareData(order.shareId))
        const multiplier: number = order.type === CONST.ORDER.TYPE.SELL ? -1 : 1

        // Create a depot entry
        const depotEntry: DepotEntry = {
            depotId: order.depotId,
            share: share,
            amount: order.amount * multiplier,
            costValue: share.lastRecordedValue * order.amount * multiplier,
        }

        // Write data to db
        await Connector.executeQuery(QueryBuilder.createShareOrder(order))
        await Connector.executeQuery(QueryBuilder.createDepotEntry(depotEntry))

        return order
    }



    /**
     * Method to write the Jobs wich are returned from stock-exchange to our db, 
     * @param jobs Array of jobs from stock-exchange
     * @param depotId depotId of user
     * @param orders Array of orders (from algorithm)
     */
    public async saveJobs(jobs: Job[], depotId: string, orders: PlaceShareOrder[], jobType: string): Promise<void> {
        if (jobs.length != orders.length) {
            throw new InternalServerErrorException("Jobs / Orders length mismatch")
        }

        for (let i = 0; i < jobs.length; i++) {
            await Connector.executeQuery(QueryBuilder.writeJobToDb(jobs[i], depotId, orders[i], jobType))
        }
    }


    /**
     * Returns all open share orders
     * @param depotId id of depot
     * @param session customer session
     * @returns an array of JobWrapper objects
     */
    public async showPendingOrders(depotId: string, session: CustomerSession): Promise<JobWrapper[]> {
        const customer: { customer: Customer, session: CustomerSession } = await this.customerService.customerLogin({ session: session })

        // Validate if customer is authorized to order on this depot
        const depot: Depot = await this.getDepotById(depotId)
        if (depot.company.companyId != customer.customer.company.companyId) {
            throw new UnauthorizedException(`Customer with id ${customer.customer.customerId} is not allowed to access depot with id ${depot.depotId}`)
        }

        return await this.getJobsByDepotId(depotId)
    }

    /**
     * Used to delete pending orders
     * @param orderId id of order
     * @param session customer session
     * @returns the deleted ShareOrder object
     */
    public async deletePendingOrder(orderId: string, session: CustomerSession): Promise<PlaceShareOrder> {

        const customer: { customer: Customer, session: CustomerSession } = await this.customerService.customerLogin({ session: session })
        const order: PlaceShareOrder = await this.getPendingOrderById(orderId)
        const depot: Depot = await this.getDepotById(order.depotId)

        // Validate if customer is authorized to order on this depot
        if (depot.company.companyId != customer.customer.company.companyId) {
            throw new UnauthorizedException(`Customer with id ${customer.customer.customerId} is not allowed to access depot with id ${depot.depotId}`)
        }

        // Delete order 
        const result: boolean = await executeApiCall<boolean>(orderManager.deleteOrder, [orderId], orderManager)

        // If error occurs throw error
        if (!result) {
            throw new NotAcceptableException(`Could not delete order ${orderId}`)
        }

        return order
    }


    public async getDepotHistory(depotId: string, customerSession: CustomerSession): Promise<ReturnShareOrder[]> {
        const customer: { customer: Customer, session: CustomerSession } = await this.customerService.customerLogin({ session: customerSession })
        const depot: Depot = await this.getDepotById(depotId)

        // Validate if customer is authorized to order on this depot
        if (depot.company.companyId != customer.customer.company.companyId) {
            throw new UnauthorizedException(`Customer with id ${customer.customer.customerId} is not allowed to access depot with id ${depot.depotId}`)
        }

        // Get completed orders 
        const result = (await Connector.executeQuery(QueryBuilder.getShareOrdersByDepotId(depotId)))

        // Create ReturnShareOrder objects
        let returnOrders: ReturnShareOrder[] = []
        let shares: Share[] = []

        // Loop over results and create response
        for (const r of result) {
            if (shares.filter(s => s.shareId === r.share_id).length === 0) {
                shares.push(await this.shareService.getShareData(r.share_id))
            }

            returnOrders.push({
                amount: r.amount,
                depotId: depotId,
                detail: r.detail,
                orderId: r.order_id,
                share: shares.filter(s => s.shareId === r.share_id)[0],
                type: r.transaction_type,
                validity: r.order_validity,
                limit: r.limit,
                market: r.market,
                stop: r.stop,
                stopLimit: r.order_stop_limit
            })
        }

        return returnOrders
    }


    /**
     * Registers a liquidity donor
     * @param registerLp needed parameters to register a liquidity donor
     * @returns a LpPosition object
     */
    public async registerLp(registerLp: RegisterLpDto): Promise<LpPosition> {
        // Validate session
        const customer: { customer: Customer, session: CustomerSession } = await this.customerService.customerLogin({ session: registerLp.customerSession })

        // Check if customer is authorized to access depot
        const depot: Depot = await this.showDepotById(registerLp.depotId, registerLp.customerSession)

        // Validate if customer is authorized to order on this depot
        if (depot.company.companyId != customer.customer.company.companyId) {
            throw new UnauthorizedException(`Customer with id ${customer.customer.customerId} is not allowed to access depot with id ${depot.depotId}`)
        }

        // Check if share is valid
        const share: Share = await this.shareService.getShareData(registerLp.shareId)

        // Check if depot has share
        const depotPosition: DepotPosition = depot.positions.filter(pos => pos.share.shareId === share.shareId)[0]

        // Check if depot has enough shares for given quote
        if (!depotPosition || depotPosition.amount < 1 || Math.floor(depotPosition.amount * registerLp.lqQuote) === 0) {
            throw new NotAcceptableException("Depot doesn't have share or too few shares")
        }

        // Create DB entry
        let { insertId } = await Connector.executeQuery(QueryBuilder.createLpEntry(depot.depotId, share.shareId, registerLp.lqQuote))

        //Return object
        const res: LpPosition = {
            lpId: insertId,
            share: share,
            depot: depot,
            lqQuote: registerLp.lqQuote
        }

        return res
    }


    /**
     * Get all LP positions fora given Depot
     * @param depotId id of the depot
     * @param customerSession customer session for authorization
     * @returns an array of LP position
     */
    public async getLpsForDepot(depotId: string, customerSession: CustomerSession): Promise<Array<LpPosition>> {
        // Validate session
        const customer: { customer: Customer, session: CustomerSession } = await this.customerService.customerLogin({ session: customerSession })

        // Check if customer is authorized to access depot
        const depot: Depot = await this.getDepotById(depotId)

        // Validate if customer is authorized to order on this depot
        if (depot.company.companyId != customer.customer.company.companyId) {
            throw new UnauthorizedException(`Customer with id ${customer.customer.customerId} is not allowed to access depot with id ${depotId}`)
        }

        // Get all LP position for the depot
        const result = await Connector.executeQuery(QueryBuilder.getLpByDepot(depotId))

        let positions: LpPosition[] = []

        // Create response array
        for (const r of result) {
            positions.push({
                depot: depot,
                lpId: r.lp_id,
                lqQuote: r.lq_quote,
                share: await this.shareService.getShareData(r.share_id)
            })
        }

        return positions
    }

    /**
     * Cancels a given LP position
     * @param cancelLp object containing cancel info and authorization
     * @returns the cancelled LP position
     */
    public async cancelLp(cancelLp: LpCancelDto): Promise<LpPosition> {
        // Validate session
        const customer: { customer: Customer, session: CustomerSession } = await this.customerService.customerLogin({ session: cancelLp.customerSession })

        // Get LP position
        const lpPosition: LpPosition = await this.getLpPositionById(cancelLp.lpId)

        // Validate if customer is authorized to access the depot
        if (customer.customer.company.companyId != lpPosition.depot.company.companyId) {
            throw new UnauthorizedException(`Customer with id ${customer.customer.customerId} is not allowed to access depot with id ${lpPosition.depot.depotId}`)
        }

        // Remove LP Position 
        await Connector.executeQuery(QueryBuilder.removeLpEntry(cancelLp.lpId))

        return lpPosition
    }


    /**
     * Returns a single share order by id
     * @param orderId 
     * @returns 
     */
    private async getPendingOrderById(orderId): Promise<PlaceShareOrder> {
        const result = (await Connector.executeQuery(QueryBuilder.getJobByOrderId(orderId)))[0]
        const order: PlaceShareOrder = {
            orderId: result.exchange_order_id,
            depotId: result.depot_id,
            type: result.transaction_type,
            detail: result.detail,
            amount: result.amount,
            shareId: result.share_id,
            validity: result.order_validity,
            stop: result.order_stop,
            limit: result.order_limit,
            market: result.market
        }

        return order
    }


    /**
     * Returns an array of all pending order for a depot
     * @param depotId 
     * @returns Array of pending orders
     */
    private async getJobsByDepotId(depotId: string): Promise<JobWrapper[]> {
        const results = (await Connector.executeQuery(QueryBuilder.getJobsByDepotId(depotId)))
        let orders: Array<JobWrapper> = []

        for (const r of results) {
            const share: Share = await this.shareService.getShareData(r.share_id)

            orders.push({
                depotId: r.depot_id,
                share: share,
                detail: r.detail,
                exchangeOrderId: r.exchange_order_id,
                orderValidity: r.order_validity,
                id: r.job_id,
                jobType: r.job_type,
                market: r.market,
                placeOrder: {
                    shareId: share.shareId,
                    amount: r.amount,
                    type: r.transaction_type,
                    limit: r.order_limit,
                    stop: r.order_stop,
                    onMatch: "",
                    onDelete: "",
                    onComplete: "",
                    onPlace: ""
                }
            })
        }

        return orders
    }

    /**
     * Retireves a LP position by id
     * @param lpId id of the LP position
     * @returns a LpPosition object
     */
    private async getLpPositionById(lpId: number): Promise<LpPosition> {
        const result = (await Connector.executeQuery(QueryBuilder.getLpById(lpId)))[0]

        if (!result) {
            throw new NotFoundException(`LP position with id ${lpId} not found`)
        }

        // Return object
        const res: LpPosition = {
            lpId: lpId,
            lqQuote: result.lq_quote,
            depot: await this.getDepotById(result.depot_id),
            share: await this.shareService.getShareData(result.share_id)
        }

        return res
    }
}
