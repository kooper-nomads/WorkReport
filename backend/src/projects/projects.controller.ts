import { Controller, Get, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import type { WorksectionProject, WorksectionProjectStatus } from '../worksection/worksection.types.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Query('status') status?: WorksectionProjectStatus): Promise<WorksectionProject[]> {
    return this.projectsService.findAll(status);
  }
}
