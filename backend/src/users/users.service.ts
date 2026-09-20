import { Injectable } from '@nestjs/common';
import { WorksectionService } from '../worksection/worksection.service.js';
import type { WorksectionResponse, WorksectionUser } from '../worksection/worksection.types.js';

@Injectable()
export class UsersService {
  constructor(private readonly worksectionService: WorksectionService) {}

  async findAll(): Promise<WorksectionUser[]> {
    const response = await this.worksectionService.request<WorksectionResponse<WorksectionUser[]>>('get_users');
    return response.data;
  }
}
