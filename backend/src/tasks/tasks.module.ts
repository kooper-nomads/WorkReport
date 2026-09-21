import { Module } from '@nestjs/common';
import { WorksectionModule } from '../worksection/worksection.module.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';

@Module({
  imports: [WorksectionModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
