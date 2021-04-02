import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { Job } from 'moonstonks-boersenapi';
import { Connector } from 'src/util/database/connector';
import { QueryBuilder } from 'src/util/database/query-builder';

@Injectable()
export class WebhookService {
    public async onPlace(data: any): Promise<void> {
        await Connector.executeQuery(QueryBuilder.updateJobWithOrderId(data.jobId, data.id))
    }

    public async onMatch(data: any): Promise<void> {
        // console.log("Inside WebhookService: onMatch")
        // console.log(data)

    }


    public async onComplete(data: any): Promise<void> {

        // TODO: Job to shareOrder
        
        await Connector.executeQuery(QueryBuilder.deleteJobByOrderId(data.orderId))
    }

    public async onDelete(data: any): Promise<void> {
        // console.log("Inside WebhookService: onDelete")
        // console.log(data)
    }

    private async jobToOrder(job: Job): Promise<void> {
        // Get job from db
        

    }

}
