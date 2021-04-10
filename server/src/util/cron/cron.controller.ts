import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CronJobs } from './cron-jobs.service'


@ApiTags('cron')
@Controller('cron')
export class CronController {

    constructor(private readonly cronService: CronJobs) { }

    @Get("test")
    async test(){
        this.cronService.runTest()
    }
}
