import { Module } from '@nestjs/common';
import { CompanyModule } from 'src/company/company.module';
import { CustomerModule } from 'src/customer/customer.module';
import { DepotController } from './depot.controller';
import { DepotService } from './depot.service';

@Module({
  imports: [CustomerModule, CompanyModule],
  controllers: [DepotController],
  providers: [DepotService],
  exports: [DepotService]
})
export class DepotModule { }
