import { Module } from '@nestjs/common';
import { WorksectionModule } from '../worksection/worksection.module.js';
import { AssignedTasksController } from './assigned-tasks.controller.js';
import { AssignedTasksService } from './assigned-tasks.service.js';

@Module({
  imports: [WorksectionModule],
  controllers: [AssignedTasksController],
  providers: [AssignedTasksService],
})
export class AssignedTasksModule {}
