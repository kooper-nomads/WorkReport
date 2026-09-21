import { Injectable } from '@nestjs/common';
import { EventsService } from '../events/events.service.js';
import { WorksectionService } from '../worksection/worksection.service.js';
import { parseWorksectionDate } from '../worksection/worksection-date.util.js';
import type { WorksectionEvent, WorksectionResponse, WorksectionTask } from '../worksection/worksection.types.js';
import type { AssignedTask } from './assigned-tasks.types.js';

interface AssignmentChange {
  time: number;
  date: string;
  fromUserId?: number;
  toUserId: number;
}

function extractUserToId(fields: Record<string, unknown> | undefined): number | undefined {
  const userTo = fields?.user_to;
  if (userTo && typeof userTo === 'object' && 'id' in userTo) {
    return (userTo as { id: number }).id;
  }
  return undefined;
}

function groupAssignmentChangesByTask(events: WorksectionEvent[]): Map<number, AssignmentChange[]> {
  const byTask = new Map<number, AssignmentChange[]>();
  for (const event of events) {
    if (event.object.type !== 'task') continue;

    const toUserId = extractUserToId(event.new);
    if (toUserId === undefined) continue;

    const change: AssignmentChange = {
      time: parseWorksectionDate(event.date_added),
      date: event.date_added,
      toUserId,
      fromUserId: extractUserToId(event.old),
    };

    const list = byTask.get(event.object.id) ?? [];
    list.push(change);
    byTask.set(event.object.id, list);
  }

  for (const list of byTask.values()) {
    list.sort((a, b) => a.time - b.time);
  }
  return byTask;
}

// Walks a task's chronological assignment changes to find whether `userId` held it at any
// point overlapping [from, to], returning the date that holding period began. Each change only
// tells us who held the task *before* it, not since when — so a match against the segment
// before the very first recorded change (i.e. the assignment predates our fetched event
// history) is reported without a known start date.
function findAssignmentWithinWindow(
  changes: AssignmentChange[],
  userId: number,
  from: number,
  to: number,
): { assignedAt?: string } | undefined {
  let match: { assignedAt?: string } | undefined;

  const first = changes[0];
  if (first.fromUserId === userId && first.time > from) {
    match = { assignedAt: undefined };
  }

  for (let i = 0; i < changes.length; i++) {
    const segmentStart = changes[i].time;
    const segmentEnd = i + 1 < changes.length ? changes[i + 1].time : Infinity;
    if (changes[i].toUserId === userId && segmentStart <= to && segmentEnd > from) {
      match = { assignedAt: changes[i].date };
    }
  }

  return match;
}

@Injectable()
export class AssignedTasksService {
  constructor(
    private readonly eventsService: EventsService,
    private readonly worksectionService: WorksectionService,
  ) {}

  async findAssigned(userId: number, from: number, to: number): Promise<AssignedTask[]> {
    const events = await this.eventsService.findEvents(from, to);
    const changesByTaskId = groupAssignmentChangesByTask(events);

    const assignedAtByTaskId = new Map<number, string | undefined>();
    for (const [taskId, changes] of changesByTaskId) {
      const match = findAssignmentWithinWindow(changes, userId, from, to);
      if (match) {
        assignedAtByTaskId.set(taskId, match.assignedAt);
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

    return tasksResponse.data.map((task) => this.toAssignedTask(task, assignedAtByTaskId.get(task.id)));
  }

  private toAssignedTask(task: WorksectionTask, assignedAt: string | undefined): AssignedTask {
    return {
      id: task.id,
      name: task.name,
      status: task.status,
      project: { id: task.project.id, name: task.project.name },
      assignee: { id: String(task.user_to.id), name: task.user_to.name },
      tags: Object.entries(task.tags ?? {}).map(([id, label]) => ({ id, label })),
      ...(assignedAt ? { assignedAt } : {}),
    };
  }
}
