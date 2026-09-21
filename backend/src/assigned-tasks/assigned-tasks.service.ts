import { BadRequestException, Injectable } from '@nestjs/common';
import { WorksectionService } from '../worksection/worksection.service.js';
import type { WorksectionEvent, WorksectionResponse, WorksectionTask } from '../worksection/worksection.types.js';
import type { AssignedTask } from './assigned-tasks.types.js';

// Temporary: reads assignment history from get_events, capped at Worksection's 30-day rolling
// window. Once webhooks persist events into our own DB, this should query that store instead
// and drop the 30-day ceiling.
function extractAssignedUserId(event: WorksectionEvent): number | undefined {
  const userTo = event.new?.user_to;
  if (userTo && typeof userTo === 'object' && 'id' in userTo) {
    return (userTo as { id: number }).id;
  }
  return undefined;
}

// Worksection date_added has no timezone offset (e.g. '2026-09-19 13:37') — treated as local
// time of the Node process. See "Possible Timezone Mismatch in Period Filtering" in the vault.
function parseWorksectionDate(dateAdded: string): number {
  return new Date(dateAdded.replace(' ', 'T')).getTime();
}

// get_events only accepts a relative rolling window (Xd|Xh|Xm) from "now" — pick the tightest
// unit that covers the requested duration, capped by Worksection's own limits per unit.
function toWorksectionPeriod(durationMs: number): string {
  const minutes = Math.ceil(durationMs / 60_000);
  if (minutes <= 360) return `${minutes}m`;

  const hours = Math.ceil(durationMs / 3_600_000);
  if (hours <= 72) return `${hours}h`;

  const days = Math.ceil(durationMs / 86_400_000);
  return `${days}d`;
}

@Injectable()
export class AssignedTasksService {
  constructor(private readonly worksectionService: WorksectionService) {}

  async findAssigned(userId: number, from: number, to: number): Promise<AssignedTask[]> {
    if (from >= to) {
      throw new BadRequestException('"from" must be before "to"');
    }

    const now = Date.now();
    const durationFromNow = now - from;
    if (durationFromNow <= 0) {
      throw new BadRequestException('"from" must be in the past');
    }
    if (durationFromNow > 30 * 86_400_000) {
      throw new BadRequestException('"from" cannot be more than 30 days ago (Worksection get_events limit)');
    }

    const eventsResponse = await this.worksectionService.request<WorksectionResponse<WorksectionEvent[]>>(
      'get_events',
      { period: toWorksectionPeriod(durationFromNow) },
    );

    const assignedAtByTaskId = new Map<number, { date: string; time: number }>();
    for (const event of eventsResponse.data) {
      if (event.object.type !== 'task') continue;
      if (extractAssignedUserId(event) !== userId) continue;

      const eventTime = parseWorksectionDate(event.date_added);
      if (eventTime < from || eventTime > to) continue;

      const taskId = event.object.id;
      const latestSoFar = assignedAtByTaskId.get(taskId);
      if (!latestSoFar || eventTime > latestSoFar.time) {
        assignedAtByTaskId.set(taskId, { date: event.date_added, time: eventTime });
      }
    }

    const taskIds = [...assignedAtByTaskId.keys()];
    if (taskIds.length === 0) {
      return [];
    }

    const tasksResponse = await this.worksectionService.request<WorksectionResponse<WorksectionTask[]>>(
      'search_tasks',
      { filter: `id in (${taskIds.join(',')})` },
    );

    return tasksResponse.data.map((task) => this.toAssignedTask(task, assignedAtByTaskId.get(task.id)!.date));
  }

  private toAssignedTask(task: WorksectionTask, assignedAt: string): AssignedTask {
    return {
      id: task.id,
      name: task.name,
      status: task.status,
      project: { id: task.project.id, name: task.project.name },
      assignee: { id: String(task.user_to.id), name: task.user_to.name },
      tags: Object.entries(task.tags ?? {}).map(([id, label]) => ({ id, label })),
      assignedAt,
    };
  }
}
