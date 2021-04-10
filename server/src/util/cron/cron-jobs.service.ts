import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { Share, ShareManager } from 'moonstonks-boersenapi'
import { exit } from 'node:process'
import { DepotService } from 'src/depot/depot.service'
import { Connector } from '../database/connector'
import { UpdateShares } from '../stock-exchange/share-updates'
import { executeApiCall, orderManager } from '../stock-exchange/stock-wrapper'
import { UpdatePrice } from '../stock-exchange/update-price.model'

const schedule = require('node-schedule')

@Injectable()
export class CronJobs {

    public test: string = "Hello World"

    constructor(
        @Inject(forwardRef(() => DepotService))
        public readonly depotService: DepotService
    ) {
        // console.log("This", this)
        this.runJobs()
    }

    /**
     * Wrapper to start all cron jobs in server start
     * @returns the ran jobs
     */
    private async runJobs(): Promise<any[]> {
        // Register Cron Job here
        const jobsFunctions = [
            this.updateHistoricalData,
            this.checkForTimedOutOrders,
            this.updateLpJobs
        ]

        let jobs: any[] = []

        for (let job of jobsFunctions) {
            jobs.push(await job(this))
        }
        
        // console.log("Starting Cron jobs")

        return jobs
    }

    /**
     * Runs periodically (every 15 mins) to update the share price for our historical data
     */
    public async updateHistoricalData(context) {
        return schedule.scheduleJob('* */15 * * * *', async function () {
            const shares: Array<Share> = await ShareManager.getShares()

            for (let i = 0; i < shares.length; i++) {
                const o: UpdatePrice = {
                    shareId: shares[i].id,
                    price: +shares[i].price,
                    timestamp: (new Date()).getTime()
                }

                UpdateShares.updateSharePrice(o)
            }
        })
    }

    /**
     * Checks if order validity is overdue, then cancel the job
     */
    public async checkForTimedOutOrders(context) {
        return schedule.scheduleJob('*/1 * * * * *', async function () {
            // Get all expired jobs from DB
            const results = await Connector.executeQuery({
                query: "SELECT * FROM job WHERE order_validity < NOW()",
                args: []
            })

            // Delete jobs on stock exchange; call on webhook deletes them from DB
            for (const r of results) {
                try {
                    await executeApiCall<boolean>(orderManager.deleteOrder, [r.exchange_order_id], orderManager)
                } catch { }
            }
        })
    }

    public async updateLpJobs(context: CronJobs) {
        // let that: CronJobs = context
        return schedule.scheduleJob('*/30 * * * * *', async function () {
            // console.log(context)
            // await context.depotService.runLps()
            // throw new Error("FUUUUK")
            
        })
    }

    public async runTest() {
        await this.depotService.runLps()
    }
}

/**
 * Used for unit tests to add days to a given date
 * @param date given date
 * @param days days to be added to given date
 * @returns the updated date
 */
export function addDays(date: Date, days: number): Date {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}