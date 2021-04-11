import { CronJobs, addDays } from "./cron-jobs.service"

describe('Test if cron jobs can be started and stopped properly', () => {
    let jobs: any[]
    
    it('runs a number of cron jobs', async () => {
        // jobs = await CronJobs.runJobs()
    })

    it('Should cancel the ran jobs', () => {
        // for(const job of jobs) {
        //     job.cancel()
        // }
    })

    it('Should test the custom date add function', () => {
        const date = new Date()
        const days = 366

        const newDate = addDays(date, days)

        expect(newDate.getFullYear() - date.getFullYear()).toBeGreaterThanOrEqual(1)
    })
})