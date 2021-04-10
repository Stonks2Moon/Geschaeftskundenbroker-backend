import { Module } from '@nestjs/common';
import { DepotModule } from 'src/depot/depot.module';
import { CronJobs } from './cron-jobs.service';

@Module({
    imports: [DepotModule],
    exports: [CronJobs],
    providers: [CronJobs]
})
export class CronModule {}
