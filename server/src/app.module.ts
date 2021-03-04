import { Module } from '@nestjs/common';
import { CostumerController } from './costumer/costumer.controller';
import { CostumerService } from './costumer/costumer.service';
import { CostumerModule } from './costumer/costumer.module';
import { TestEndpointModule } from './test-endpoint/test-endpoint.module';

@Module({
  imports: [CostumerModule, TestEndpointModule],
  controllers: [CostumerController],
  providers: [CostumerService],
})
export class AppModule {}
