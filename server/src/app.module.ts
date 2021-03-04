import { Module } from '@nestjs/common';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { TestEndpointModule } from './test-endpoint/test-endpoint.module';

@Module({
  imports: [UserModule, TestEndpointModule],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}
