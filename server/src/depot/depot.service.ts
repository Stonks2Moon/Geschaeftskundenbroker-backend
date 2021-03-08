import { BadRequestException, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { CustomerSession } from 'src/customer/customer-session.model';
import { Depot } from './depot.model';
import { CreateDepotDto } from './dto/create-depot.dto';
import { PlaceOrderDto } from './dto/place-order.dto';
import { ReturnShareOrder } from './dto/share-order.dto';
import { BörsenAPI } from 'moonstonks-boersenapi';
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
    constructor(
        private readonly customerService: CustomerService,
        private readonly companyService: CompanyService,
        private readonly shareService: ShareService
    ) {}

    // private stockApi: BörsenAPI = new BörsenAPI('moonstonks token', 'onMatch', 'onComplete', 'onDelete');

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
        // Validate parameters

        // switch(placeOrder.)
        
        throw new NotImplementedException()
    }

    public async showAllDepots(customerSession: CustomerSession): Promise<Array<Depot>> {
        // Validate Session
        const customer: {customer: Customer, session: CustomerSession} = await this.customerService.customerLogin({ session: customerSession })

        // get depots for company
        let depots: Depot[] = await this.getDepotsByCompanyId(customer.customer.company)
        
        for(let d of depots) {
            const pos: DepotPosition[] = await this.getDepotPositions(d.depotId)
            d.summary = this.depotSummaryFromPositions(pos)
        }

        // await depots.forEach(async (d, i, a) => {
        //     a[i].positions = await this.getDepotPositions(d.depotId)
        //     console.log(a[i].positions)
        //     console.log(d.positions)
        //     a[i].summary = this.depotSummaryFromPositions(d.positions)
        // })

        return depots
    }

    private async getDepotsByCompanyId(company: Company): Promise<Depot[]> {
        // Get depot by company id from DB
        const results = await Connector.executeQuery(QueryBuilder.getDepotByCompanyId(company.companyId))

        // Generate
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

    private depotSummaryFromPositions(positions: DepotPosition[]): DepotSummary {
        let totalCostValue: number = 0
        let totalCurrentValue: number = 0
        let percentageChange: number = 0
        
        positions.forEach(p => {
            totalCostValue += p.costValue
            totalCurrentValue += p.currentValue
        })
        
        percentageChange = 100 * ((totalCurrentValue - totalCostValue) / totalCostValue)

        const depotSummay: DepotSummary = {
            totalValue: totalCurrentValue,
            percentageChange: percentageChange
        }
        return depotSummay
    }

    private async getDepotPositions(depotId: string): Promise<DepotPosition[]> {
        const results = await Connector.executeQuery(QueryBuilder.getDepotEntriesByDepotId(depotId))

        let depotEntries: DepotEntry[] = []
        let shares: Share[] = []

        for(const e of results) {
            if(!this.shareService.shareIdInShareArray(e.share_id, shares)) {
                shares.push(await this.shareService.getShareData(e.share_id))
            }

            depotEntries.push({
                depotId: depotId,
                amount: e.amount,
                costValue: e.cost_value,
                share: (shares.filter(s => { return e.share_id === s.shareId}))[0]
            })
        }

        // Summarize to DepotPosition
        let depotPositions: DepotPosition[] = []

        for(const s of shares) {
            let totalAmount: number = 0
            let totalCostValue: number = 0
            let totalCurrentValue: number = 0
            let percentageChange: number = 0

            for(const e of depotEntries.filter(e => { return e.share.shareId === s.shareId })) {
                totalAmount += e.amount
                totalCostValue += e.costValue
            }

            totalCurrentValue = totalAmount * s.lastRecordedValue
            percentageChange = 100 * ((totalCurrentValue - totalCostValue) / totalCostValue)

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

    private async getDepotById(depotId: string, company?: Company): Promise<Depot> {
        const result = (await Connector.executeQuery(QueryBuilder.getDepotById(depotId)))[0]

        if(!result) {
            throw new NotFoundException("Depot now found")
        }

        const depot: Depot = {
            depotId: depotId,
            name: result.name,
            description: result.description,
            company: null
        }

        if(!company) {
            depot.company = await this.companyService.getCompanyById(result.company_id)
        } else {
            depot.company = company
        }

        return depot
    }

    public async showDepotById(depotId: string, customerSession: CustomerSession): Promise<Depot> {
        // Validate Session
        const customer: {customer: Customer, session: CustomerSession} = await this.customerService.customerLogin({ session: customerSession })

        let depot: Depot = await this.getDepotById(depotId)
        depot.positions = await this.getDepotPositions(depotId)

        return depot
    }
}
