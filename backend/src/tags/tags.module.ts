import { Module } from '@nestjs/common';
import { WorksectionModule } from '../worksection/worksection.module.js';
import { TagsController } from './tags.controller.js';
import { TagsService } from './tags.service.js';

@Module({
  imports: [WorksectionModule],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
