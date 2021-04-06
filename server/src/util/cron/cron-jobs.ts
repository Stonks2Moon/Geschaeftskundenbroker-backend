const schedule = require('node-schedule')
const { Job, _, __ } = require('node-schedule/lib/Job')
const CronJob = typeof Job
import { Share, ShareManager } from 'moonstonks-boersenapi'
import { UpdateShares } from '../stock-exchange/share-updates'
import { UpdatePrice } from '../stock-exchange/update-price.model'

export class CronJobs {

    /**
     * Wrapper to start all cron jobs in server start
     * @returns the ran jobs
     */
    public static async runJobs(): Promise<any[]> {
        // Register Cron Job here
        const jobsFunctions = [
            CronJobs.updateHistoricalData
        ]

        let jobs: any[] = []

        for (let job of jobsFunctions) {
            jobs.push(await job())
        }

        return jobs
    }

    /**
     * Runs periodically (every 15 mins) to update the share price for our historical data
     */
    public static async updateHistoricalData() {
        return schedule.scheduleJob('* */15 * * * *', async function () {
            const shares: Array<Share> = await ShareManager.getShares()

            for (let i = 0; i < shares.length; i++) {
                const o: UpdatePrice = {
                    shareId: shares[i].id,
                    price: +shares[i].price,
                    timestamp: (new Date()).getMilliseconds()
                }

                UpdateShares.updateSharePrice(o)
            }
        })
    }

    /**
     * Checks if order validity is overdue, then cancel the job
     */
    // public static async checkForTimedOutOrders() {
    //     return schedule.scheduleJob('*/1 * * * * *', async function () {
    //         // TODO
    //     })
    // }

}

export function addDays(date: Date, days: number): Date {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}