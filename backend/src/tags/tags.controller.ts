import { Controller, Get } from '@nestjs/common';
import { TagsService } from './tags.service.js';
import type { WorksectionTagGroup, WorksectionTaskTag } from '../worksection/worksection.types.js';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll(): Promise<WorksectionTaskTag[]> {
    return this.tagsService.findAll();
  }

  @Get('groups')
  findGroups(): Promise<WorksectionTagGroup[]> {
    return this.tagsService.findGroups();
  }
}
