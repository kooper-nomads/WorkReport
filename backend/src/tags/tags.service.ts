import { Injectable } from '@nestjs/common';
import { WorksectionService } from '../worksection/worksection.service.js';
import type { WorksectionResponse, WorksectionTaskTag } from '../worksection/worksection.types.js';

@Injectable()
export class TagsService {
  constructor(private readonly worksectionService: WorksectionService) {}

  async findAll(): Promise<WorksectionTaskTag[]> {
    const response = await this.worksectionService.request<WorksectionResponse<WorksectionTaskTag[]>>(
      'get_task_tags',
    );
    return response.data;
  }
}
