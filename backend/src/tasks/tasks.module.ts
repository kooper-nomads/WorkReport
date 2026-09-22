import { Module } from '@nestjs/common';
import { WorksectionClientModule } from '../worksection-client/worksection-client.module.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';

@Module({
  imports: [WorksectionClientModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
