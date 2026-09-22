import { BadRequestException, Injectable } from '@nestjs/common';
import { WorksectionService } from '../worksection/worksection.service.js';
import { formatWorksectionFilterDate } from '../worksection/worksection-date.util.js';
import type { WorksectionResponse, WorksectionTask } from '../worksection/worksection.types.js';
import { isTaskStatusTag, resolveTaskStatusGroup } from './task-status-group.js';
import type { AssignedTask, TasksGroupedByStatus } from './tasks.types.js';

@Injectable()
export class TasksService {
  constructor(private readonly worksectionService: WorksectionService) {}

  async findActive(userEmails: string[]): Promise<AssignedTask[]> {
    const emails = this.requireEmails(userEmails);

    // get_all_tasks has no email/user filter of its own — it always returns open tasks across
    // every project, so the assignee filter has to happen on our side.
    const response = await this.worksectionService.request<WorksectionResponse<WorksectionTask[]>>('get_all_tasks', {
      filter: 'active',
    });

    return response.data
      .filter((task) => emails.has(task.user_to.email))
      .map((task) => this.toAssignedTask(task));
  }

  async findDone(userEmails: string[], from: number, to: number): Promise<AssignedTask[]> {
    const emails = this.requireEmails(userEmails);
    if (from >= to) {
      throw new BadRequestException('"from" must be before "to"');
    }

    // search_tasks' own email_user_to param only accepts a single address, so for multiple
    // users the assignee filter happens on our side, same as findActive.
    const filter = `dateclose>='${formatWorksectionFilterDate(from)}' and dateclose<='${formatWorksectionFilterDate(to)}'`;
    const response = await this.worksectionService.request<WorksectionResponse<WorksectionTask[]>>('search_tasks', {
      status: 'done',
      filter,
    });

    return response.data
      .filter((task) => emails.has(task.user_to.email))
      .map((task) => this.toAssignedTask(task));
  }

  // The date range only constrains tasks whose actual Worksection `status` is `done` — active
  // tasks have no `dateclose` yet, so they're fetched unfiltered.
  async findGroupedByStatus(userEmails: string[], from: number, to: number): Promise<TasksGroupedByStatus> {
    const [activeTasks, doneTasks] = await Promise.all([
      this.findActive(userEmails),
      this.findDone(userEmails, from, to),
    ]);

    const grouped: TasksGroupedByStatus = { todo: [], in_progress: [], done: [] };

    for (const task of [...activeTasks, ...doneTasks]) {
      const group = resolveTaskStatusGroup(task.statusTag, task.status);
      grouped[group].push(task);
    }

    return grouped;
  }

  private requireEmails(userEmails: string[]): Set<string> {
    const emails = userEmails.filter((email) => email.length > 0);
    if (emails.length === 0) {
      throw new BadRequestException('"userEmail" is required');
    }

    return new Set(emails);
  }

  private toAssignedTask(task: WorksectionTask): AssignedTask {
    const tags = Object.entries(task.tags ?? {}).map(([id, label]) => ({ id, label }));
    const statusTag = tags.map((tag) => tag.label.trim().toUpperCase()).find(isTaskStatusTag) ?? null;

    return {
      id: task.id,
      name: task.name,
      status: task.status,
      statusTag,
      project: { id: task.project.id, name: task.project.name },
      author: { id: String(task.user_from.id), name: task.user_from.name },
      assignee: { id: String(task.user_to.id), name: task.user_to.name },
      tags: tags.filter(tag => tag.label !== statusTag), // Exclude the status tag from the tags list
    };
  }
}
