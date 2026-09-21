import { Module } from '@nestjs/common';
import { WorksectionModule } from '../worksection/worksection.module.js';
import { EventsModule } from '../events/events.module.js';
import { ReportController } from './report.controller.js';
import { ReportService } from './report.service.js';

@Module({
  imports: [WorksectionModule, EventsModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
