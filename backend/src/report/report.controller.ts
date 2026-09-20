import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ReportService } from './report.service.js';
import type { ReportTask } from './report.types.js';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  getReport(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('days', ParseIntPipe) days: number,
  ): Promise<ReportTask[]> {
    return this.reportService.getReport(userId, days);
  }
}
