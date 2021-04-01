const schedule = require('node-schedule');
import { Share, ShareManager } from 'moonstonks-boersenapi';
import { UpdateShares } from '../stock-exchange/share-updates';
import { UpdatePrice } from '../stock-exchange/update-price.model';

export class CronJobs {

    /**
     * Wrapper to start all cron jobs in server start
     */
    public static async runJobs(): Promise<void> {
        // Register Cron Job here
        const jobs = [
            CronJobs.updateHistoricalData
        ]

        for (let job of jobs) {
            job();
        }
    }

    public static async updateHistoricalData() {
        schedule.scheduleJob('0 */15 * * * *', async function () {
            const shares: Array<Share> = await ShareManager.getShares();

            for (let i = 0; i < shares.length; i++) {
                const o: UpdatePrice = {
                    shareId: shares[i].id,
                    price: +shares[i].price,
                    timestamp: (new Date()).getMilliseconds()
                };

                UpdateShares.updateSharePrice(o);
            }
        });
    }
}