import { Inject, Injectable } from '@nestjs/common';
import { WORKSECTION_CLIENT, type WorksectionClient } from '../worksection/worksection-client.interface.js';
import type { WorksectionResponse, WorksectionUser } from '../worksection/worksection.types.js';

@Injectable()
export class UsersService {
  constructor(@Inject(WORKSECTION_CLIENT) private readonly worksectionClient: WorksectionClient) {}

  async findAll(): Promise<WorksectionUser[]> {
    const response = await this.worksectionClient.request<WorksectionResponse<WorksectionUser[]>>('get_users');
    return response.data;
  }
}
