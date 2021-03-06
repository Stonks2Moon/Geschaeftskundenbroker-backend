import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { OrderCompletedDto, OrderDeletedDto, OrderMatchedDto } from 'moonstonks-boersenapi'
import { DeleteOrderDto } from 'moonstonks-boersenapi/dist/dtos/DeleteOrder.dto'
import { PlaceOrderDto } from 'moonstonks-boersenapi/dist/dtos/PlaceOrder.dto'
import { ShareService } from 'src/share/share.service'
import { Connector } from 'src/util/database/connector'
import { QueryBuilder } from 'src/util/database/query-builder'
import { JobWrapper } from './dto/job-wrapper.dto'
import * as CONST from "../util/const"
import { PlaceShareOrder, ReturnShareOrder } from 'src/depot/dto/share-order.dto'
import { DepotService } from 'src/depot/depot.service'


@Injectable()
export class WebhookService {
    constructor(
        private readonly shareService: ShareService,
        private readonly depotService: DepotService
    ) { }

    /**
     * Called by stock-exchange if order is placed
     * Used to update job on db
     * @param data data from stock-exchange
     */
    public async onPlace(data: any): Promise<void> {
        // console.log("Called onPlace: ", data.id)
        await Connector.executeQuery(QueryBuilder.updateJobWithOrderId(data.jobId, data.id))
    }

    /**
     * Called by stock-exchange
     * @param data 
     */
    public async onMatch(data: OrderMatchedDto): Promise<void> {
        // console.log("Called onMatch: ", data.orderId)

        // Increase cost_value field on matched job
        if (isNaN(data.amount) || isNaN(data.price)) {
            console.error(`data.amount: ${data.amount}, data.price: ${data.amount}`)
            throw new BadRequestException(`data.amount: ${data.amount}, data.price: ${data.amount}`)
        }

        const increase = data.amount * data.price
        await Connector.executeQuery(QueryBuilder.increaseJobCostValue(data.orderId, increase))
    }


    /**
     * Delete job from DB, if necessary create Share order and depot entry
     * @param data 
     */
    public async onComplete(data: OrderCompletedDto): Promise<void> {
        // console.log("Called onComplete", data.orderId)

        // Get Job from DB
        const job: JobWrapper = await this.getJobById({ orderId: data.orderId })

        // Depending on job type:
        if (job.jobType === CONST.JOB_TYPES.PLACE) {
            // Transform job into executed share_order
            const order: ReturnShareOrder = await this.jobToOrder(job)
            await this.depotService.saveShareOrder(order)

            // Delete job from db
            await Connector.executeQuery(QueryBuilder.deleteJobByJobId(job.id))
        } else {
            console.error(`Unhandled Job type ${job.jobType}`)
        }
    }

    /**
     * Delete a pending job after deletion confirmation from stock api
     * @param data 
     */
    public async onDelete(data: OrderDeletedDto): Promise<void> {
        // console.log("Called onDelete", data)
        const job: JobWrapper = await this.getJobById({ orderId: data.orderId })
        await Connector.executeQuery(QueryBuilder.deleteJobByJobId(job.id))
    }

    /**
     * Creates a PlaceShareOrder object from a JobWrapper object
     * @param job JobWrapper object 
     * @returns PlaceShareOrder object
     */
    private async jobToOrder(job: JobWrapper): Promise<ReturnShareOrder> {
        const order: ReturnShareOrder = {
            amount: job.placeOrder.amount,
            depotId: job.depotId,
            detail: job.detail,
            orderId: job.id,
            share: await this.shareService.getShareData(job.share.shareId),
            type: job.placeOrder.type,
            validity: job.orderValidity,
            limit: job.placeOrder.limit,
            market: job.market,
            stop: job.placeOrder.stop,
            costValue: job.costValue,
            isLp: job.isLp
        }

        return order
    }


    /**
     * Used to get a job by it's id or an order id
     * @param info object containing a order id or a job id
     * @returns a JobWrapper object 
     */
    private async getJobById(info: {
        jobId?: string,
        orderId?: string
    }): Promise<JobWrapper> {

        // Get job from DB
        const result = (await Connector.executeQuery(QueryBuilder.getJobById(info)))[0]

        if (!result) {
            console.error(`Job with id ${info.jobId} not found`)
            throw new NotFoundException("Job not found")
        }

        // Get share object
        const share = (await this.shareService.getShareData(result.share_id))

        // Transform result into JobWrapper object
        let order: any

        // Transform depending on job type
        if (result.job_type === CONST.JOB_TYPES.PLACE) {
            order = {
                amount: result.amount,
                orderId: result.exchange_order_id,
                shareId: share.shareId,
                type: result.transaction_type,
                limit: result.order_limit,
                stop: result.order_stop,

                onComplete: "",
                onDelete: "",
                onMatch: "",
                onPlace: ""
            } as PlaceOrderDto
        } else if (result.job_type === CONST.JOB_TYPES.DELETE) {
            order = {
                orderId: result.exchange_order_id
            } as DeleteOrderDto
        }

        // Wrap job in JobWrapper object
        let job: JobWrapper = {
            share: share,
            depotId: result.depot_id,
            detail: result.detail,
            exchangeOrderId: result.exchange_order_id,
            orderValidity: result.order_validity,
            jobType: result.job_type,
            id: result.job_id,
            deleteOrder: result.job_type === CONST.JOB_TYPES.DELETE ? order : undefined,
            placeOrder: result.job_type === CONST.JOB_TYPES.PLACE ? order : undefined,

            market: result.market,
            costValue: result.cost_value,
            isLp: result.is_lp_job == 1 ? true : false
        }

        return job
    }
}