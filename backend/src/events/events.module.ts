import { Module } from '@nestjs/common';
import { WorksectionModule } from '../worksection/worksection.module.js';
import { EventsService } from './events.service.js';

@Module({
  imports: [WorksectionModule],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
