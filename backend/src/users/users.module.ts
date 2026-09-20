import { Module } from '@nestjs/common';
import { WorksectionModule } from '../worksection/worksection.module.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [WorksectionModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
