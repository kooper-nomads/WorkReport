import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import type { AssignedTask, TasksGroupedByStatus } from './tasks.types.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('active')
  findActive(@Query('userEmail') userEmail: string): Promise<AssignedTask[]> {
    return this.tasksService.findActive(userEmail);
  }

  @Get('done')
  findDone(
    @Query('userEmail') userEmail: string,
    @Query('from', ParseIntPipe) from: number,
    @Query('to', ParseIntPipe) to: number,
  ): Promise<AssignedTask[]> {
    return this.tasksService.findDone(userEmail, from, to);
  }

  @Get('by-status')
  findGroupedByStatus(
    @Query('userEmail') userEmail: string,
    @Query('from', ParseIntPipe) from: number,
    @Query('to', ParseIntPipe) to: number,
  ): Promise<TasksGroupedByStatus> {
    return this.tasksService.findGroupedByStatus(userEmail, from, to);
  }
}
