import { Module } from '@nestjs/common';
import { DepotModule } from 'src/depot/depot.module';
import { CronJobs } from './cron-jobs.service';
import { CronController } from './cron.controller';

@Module({
    imports: [DepotModule],
    exports: [CronJobs],
    providers: [CronJobs],
    controllers: [CronController]
})
export class CronModule {}
