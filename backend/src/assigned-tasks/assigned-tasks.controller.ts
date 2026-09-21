import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { AssignedTasksService } from './assigned-tasks.service.js';
import type { AssignedTask } from './assigned-tasks.types.js';

@Controller('assigned-tasks')
export class AssignedTasksController {
  constructor(private readonly assignedTasksService: AssignedTasksService) {}

  @Get()
  findAssigned(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('from', ParseIntPipe) from: number,
    @Query('to', ParseIntPipe) to: number,
  ): Promise<AssignedTask[]> {
    return this.assignedTasksService.findAssigned(userId, from, to);
  }
}
