import { Injectable } from '@nestjs/common';
import { WorksectionService } from '../worksection/worksection.service.js';
import type {
  WorksectionProject,
  WorksectionProjectStatus,
  WorksectionResponse,
} from '../worksection/worksection.types.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly worksectionService: WorksectionService) {}

  async findAll(status?: WorksectionProjectStatus): Promise<WorksectionProject[]> {
    const response = await this.worksectionService.request<WorksectionResponse<WorksectionProject[]>>(
      'get_projects',
      status ? { filter: status } : {},
    );
    return response.data;
  }
}
