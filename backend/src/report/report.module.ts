import { Module } from '@nestjs/common';
import { WorksectionModule } from '../worksection/worksection.module.js';
import { ReportController } from './report.controller.js';
import { ReportService } from './report.service.js';

@Module({
  imports: [WorksectionModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
