import { Module } from '@nestjs/common';
import { CustomerModule } from './customer/customer.module';
import { CompanyModule } from './company/company.module';
import { ShareController } from './share/share.controller';
import { ShareService } from './share/share.service';
import { ShareModule } from './share/share.module';
import { DepotModule } from './depot/depot.module';

@Module({
  imports: [CompanyModule, CustomerModule, ShareModule, DepotModule],
  controllers: [ShareController],
  providers: [ShareService],
})
export class AppModule { }
