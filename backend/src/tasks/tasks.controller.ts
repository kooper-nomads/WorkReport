import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import type { AssignedTask, TasksGroupedByStatus } from './tasks.types.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('active')
  findActive(@Query('userEmail') userEmail: string | string[] = []): Promise<AssignedTask[]> {
    return this.tasksService.findActive(toArray(userEmail));
  }

  @Get('done')
  findDone(
    @Query('userEmail') userEmail: string | string[] = [],
    @Query('from', ParseIntPipe) from: number,
    @Query('to', ParseIntPipe) to: number,
  ): Promise<AssignedTask[]> {
    return this.tasksService.findDone(toArray(userEmail), from, to);
  }

  @Get('by-status')
  findGroupedByStatus(
    @Query('userEmail') userEmail: string | string[] = [],
    @Query('from', ParseIntPipe) from: number,
    @Query('to', ParseIntPipe) to: number,
  ): Promise<TasksGroupedByStatus> {
    return this.tasksService.findGroupedByStatus(toArray(userEmail), from, to);
  }
}

// A single `?userEmail=x` query param arrives as a string; only two or more repeated params
// (`?userEmail=x&userEmail=y`) are parsed into an array.
function toArray(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}
