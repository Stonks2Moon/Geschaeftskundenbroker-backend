import { Module } from '@nestjs/common';
import { DepotController } from './depot.controller';
import { DepotService } from './depot.service';

@Module({
  controllers: [DepotController],
  providers: [DepotService],
  exports: [DepotService]
})
export class DepotModule {}
