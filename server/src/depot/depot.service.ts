import { BadRequestException, Injectable, NotImplementedException } from '@nestjs/common';
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

@Injectable()
export class DepotService {
    constructor(
        private readonly customerService: CustomerService,
        private readonly companyService: CompanyService
    ) { }

    private stockApi: BörsenAPI = new BörsenAPI('moonstonks token', 'onMatch', 'onComplete', 'onDelete');

    public async createDepot(createDepot: CreateDepotDto): Promise<Depot> {
        // Validate Session
        const customer: { customer: Customer, session: CustomerSession } = await this.customerService.customerLogin({ session: createDepot.session });

        // Check input
        if (!createDepot.name || createDepot.name === "") {
            throw new BadRequestException("Invalid name");
        }

        // Get company from customer
        const companyId: string = customer.customer.company.companyId

        // Generate DepotId
        const depotId: string = uuid();

        // Create Depot
        await Connector.executeQuery(QueryBuilder.createDepot(depotId, companyId, createDepot.name, createDepot.description));

        // Get and return created depot
        return await this.showDepotById(depotId, customer.session);
    }

    public async placeOrder(placeOrder: PlaceOrderDto): Promise<ReturnShareOrder> {
        // Validate parameters

        // switch(placeOrder.)

        throw new NotImplementedException();
    }

    public async showAllDepots(customerSession: CustomerSession): Promise<Array<Depot>> {
        throw new NotImplementedException();
    }

    public async showDepotById(depotId: string, customerSession: CustomerSession): Promise<Depot> {
        // Validate Session
        const customer: { customer: Customer, session: CustomerSession } = await this.customerService.customerLogin({ session: customerSession });

        throw new NotImplementedException();
    }
}
