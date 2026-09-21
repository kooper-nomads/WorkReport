import { Module } from '@nestjs/common';
import { WorksectionModule } from '../worksection/worksection.module.js';
import { EventsModule } from '../events/events.module.js';
import { AssignedTasksController } from './assigned-tasks.controller.js';
import { AssignedTasksService } from './assigned-tasks.service.js';

@Module({
  imports: [WorksectionModule, EventsModule],
  controllers: [AssignedTasksController],
  providers: [AssignedTasksService],
})
export class AssignedTasksModule {}
