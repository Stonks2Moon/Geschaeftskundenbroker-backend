import { Injectable, NotImplementedException } from '@nestjs/common';
import { CustomerSession } from 'src/customer/customer-session.model';
import { Depot } from './depot.model';
import { CreateDepotDto } from './dto/create-depot.dto';
import { PlaceOrderDto } from './dto/place-order.dto';
import { ReturnShareOrder } from './dto/share-order.dto';
import { BörsenAPI } from 'moonstonks-boersenapi';

@Injectable()
export class DepotService {

    private stockApi: BörsenAPI = new BörsenAPI('moonstonks token', 'onMatch', 'onComplete', 'onDelete');

    public async createDepot(createDepot: CreateDepotDto): Promise<Depot> {
        
        throw new NotImplementedException();
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
        throw new NotImplementedException();
    }
}
