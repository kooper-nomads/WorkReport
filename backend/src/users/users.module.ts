import { Module } from '@nestjs/common';
import { WorksectionClientModule } from '../worksection-client/worksection-client.module.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [WorksectionClientModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
