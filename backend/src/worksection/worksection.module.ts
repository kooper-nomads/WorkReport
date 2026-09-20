import { Module } from '@nestjs/common';
import { WorksectionService } from './worksection.service.js';

@Module({
  providers: [WorksectionService],
  exports: [WorksectionService],
})
export class WorksectionModule {}
