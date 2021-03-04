import { Module } from '@nestjs/common';
import { TestEndpointController } from './test-endpoint.controller';

@Module({
  controllers: [TestEndpointController]
})
export class TestEndpointModule {}
