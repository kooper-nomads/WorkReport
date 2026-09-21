import { BadRequestException, Injectable } from '@nestjs/common';
import { WorksectionService } from '../worksection/worksection.service.js';
import { formatWorksectionFilterDate } from '../worksection/worksection-date.util.js';
import type { WorksectionResponse, WorksectionTask } from '../worksection/worksection.types.js';
import type { AssignedTask } from './tasks.types.js';

const ONE_DAY_MS = 86_400_000;

@Injectable()
export class TasksService {
  constructor(private readonly worksectionService: WorksectionService) {}

  async findActive(userEmail: string): Promise<AssignedTask[]> {
    if (!userEmail) {
      throw new BadRequestException('"userEmail" is required');
    }

    const response = await this.worksectionService.request<WorksectionResponse<WorksectionTask[]>>('search_tasks', {
      email_user_to: userEmail,
      status: 'active',
    });

    return response.data.map((task) => this.toAssignedTask(task));
  }

  async findDone(userEmail: string, from: number, to: number): Promise<AssignedTask[]> {
    if (!userEmail) {
      throw new BadRequestException('"userEmail" is required');
    }
    if (from >= to) {
      throw new BadRequestException('"from" must be before "to"');
    }

    // Worksection's `>=`/`<=` on dateclose exclude the exact boundary day itself (confirmed by
    // probing the live API) — pad both bounds by a day to make the range actually inclusive.
    const filter = `dateclose>='${formatWorksectionFilterDate(from - ONE_DAY_MS)}' and dateclose<='${formatWorksectionFilterDate(to + ONE_DAY_MS)}'`;

    const response = await this.worksectionService.request<WorksectionResponse<WorksectionTask[]>>('search_tasks', {
      email_user_to: userEmail,
      status: 'done',
      filter,
    });

    return response.data.map((task) => this.toAssignedTask(task));
  }

  private toAssignedTask(task: WorksectionTask): AssignedTask {
    return {
      id: task.id,
      name: task.name,
      status: task.status,
      project: { id: task.project.id, name: task.project.name },
      assignee: { id: String(task.user_to.id), name: task.user_to.name },
      tags: Object.entries(task.tags ?? {}).map(([id, label]) => ({ id, label })),
    };
  }
}
