import { Injectable, NotImplementedException } from '@nestjs/common';
import { CustomerSession } from 'src/customer/customer-session.model';
import { Depot } from './depot.model';
import { CreateDepotDto } from './dto/create-depot.dto';
import { PlaceOrderDto } from './dto/place-order.dto';
import { Order } from './order.model';

@Injectable()
export class DepotService {

    public async createDepot(createDepot: CreateDepotDto) {
        throw new NotImplementedException();
    }

    public async placeOrder(placeOrder: PlaceOrderDto): Promise<Order> {
        throw new NotImplementedException();
    }

    public async showAllDepots(customerSession: CustomerSession): Promise<Array<Depot>> {
        throw new NotImplementedException();
    }

    public async showDepotById(depotId: string, customerSession: CustomerSession): Promise<Depot> {
        throw new NotImplementedException();
    }
}
