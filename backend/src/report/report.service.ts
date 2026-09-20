import { BadRequestException, Injectable } from '@nestjs/common';
import { WorksectionService } from '../worksection/worksection.service.js';
import type { WorksectionEvent, WorksectionResponse, WorksectionTask } from '../worksection/worksection.types.js';
import type { ReportTask } from './report.types.js';

const UPDATE_FIELD_LABELS: Record<string, string> = {
  title: 'назву',
  tags: 'мітки',
  user_to: 'виконавця',
  priority: 'пріоритет',
};

function extractTaskId(event: WorksectionEvent): number | undefined {
  if (event.object.type === 'task') {
    return event.object.id;
  }

  const match = event.object.page.match(/\/task\/(\d+)\//);
  return match ? Number(match[1]) : undefined;
}

function describeEvent(event: WorksectionEvent): string {
  switch (event.action) {
    case 'post':
      return 'Задачу створено';
    case 'close':
      return 'Задачу закрито';
    case 'reopen':
      return 'Задачу повторно відкрито';
    case 'delete':
      return 'Задачу видалено';
    case 'update': {
      const changed = Object.keys(event.new ?? {}).map((field) => UPDATE_FIELD_LABELS[field] ?? field);
      return changed.length > 0 ? `Змінено: ${changed.join(', ')}` : 'Задачу оновлено';
    }
    default:
      return `Подія: ${event.action}`;
  }
}

@Injectable()
export class ReportService {
  constructor(private readonly worksectionService: WorksectionService) {}

  async getReport(userId: number, days: number): Promise<ReportTask[]> {
    if (days < 1 || days > 30) {
      throw new BadRequestException('days must be between 1 and 30 (Worksection get_events limit)');
    }

    const eventsResponse = await this.worksectionService.request<WorksectionResponse<WorksectionEvent[]>>(
      'get_events',
      { period: `${days}d` },
    );

    const eventsByTaskId = new Map<number, WorksectionEvent[]>();
    for (const event of eventsResponse.data) {
      if (event.user_from.id !== userId) continue;

      const taskId = extractTaskId(event);
      if (taskId === undefined) continue;

      const events = eventsByTaskId.get(taskId) ?? [];
      events.push(event);
      eventsByTaskId.set(taskId, events);
    }

    const taskIds = [...eventsByTaskId.keys()];
    if (taskIds.length === 0) {
      return [];
    }

    const tasksResponse = await this.worksectionService.request<WorksectionResponse<WorksectionTask[]>>(
      'search_tasks',
      { filter: `id in (${taskIds.join(',')})` },
    );

    return tasksResponse.data.map((task) => this.toReportTask(task, eventsByTaskId.get(task.id) ?? []));
  }

  private toReportTask(task: WorksectionTask, events: WorksectionEvent[]): ReportTask {
    return {
      id: task.id,
      name: task.name,
      status: task.status,
      author: { id: String(task.user_from.id), name: task.user_from.name },
      assignee: { id: String(task.user_to.id), name: task.user_to.name },
      tags: Object.entries(task.tags).map(([id, label]) => ({ id, label })),
      events: events.map((event, index) => ({
        id: `${task.id}-${index}`,
        action: event.action,
        date: event.date_added,
        userFrom: event.user_from.name,
        summary: describeEvent(event),
      })),
    };
  }
}
