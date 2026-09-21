import { BadRequestException, Injectable } from '@nestjs/common';
import { EventsService } from '../events/events.service.js';
import { WorksectionService } from '../worksection/worksection.service.js';
import { parseWorksectionDate } from '../worksection/worksection-date.util.js';
import type { WorksectionEvent, WorksectionResponse, WorksectionTask } from '../worksection/worksection.types.js';
import type { ReportTask } from './report.types.js';

const UPDATE_FIELD_LABELS: Record<string, string> = {
  title: 'назву',
  text: 'опис',
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

function getEventType(event: WorksectionEvent): 'task' | 'comment' {
  return event.object.type === 'comment' ? 'comment' : 'task';
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.map((item) => formatValue(item)).join(', ') : '—';
  }
  if (value === '' || value === null || value === undefined) {
    return '—';
  }
  if (typeof value === 'object') {
    return 'name' in value ? String((value as { name: unknown }).name) : JSON.stringify(value);
  }
  return String(value);
}

function describeUpdate(event: WorksectionEvent): string {
  const newFields = event.new ?? {};
  const oldFields = event.old ?? {};
  const fields = Object.keys(newFields);

  if (fields.length === 0) {
    return 'Задачу оновлено';
  }

  const changes = fields.map((field) => {
    const label = UPDATE_FIELD_LABELS[field] ?? field;
    const newValue = formatValue(newFields[field]);
    return field in oldFields
      ? `${label}: «${formatValue(oldFields[field])}» → «${newValue}»`
      : `${label}: «${newValue}»`;
  });

  return `Оновлено — ${changes.join('; ')}`;
}

function describeComment(event: WorksectionEvent): string {
  const text = event.new?.text;
  return typeof text === 'string' && text.length > 0 ? `Додано коментар: «${text}»` : 'Додано коментар';
}

function describeEvent(event: WorksectionEvent): string {
  if (event.object.type === 'comment') {
    return describeComment(event);
  }

  switch (event.action) {
    case 'post':
      return 'Задачу створено';
    case 'close':
      return 'Задачу закрито';
    case 'reopen':
      return 'Задачу повторно відкрито';
    case 'delete':
      return 'Задачу видалено';
    case 'update':
      return describeUpdate(event);
    default:
      return `Подія: ${event.action}`;
  }
}

@Injectable()
export class ReportService {
  constructor(
    private readonly eventsService: EventsService,
    private readonly worksectionService: WorksectionService,
  ) {}

  async getReport(userId: number, days: number): Promise<ReportTask[]> {
    if (days < 1 || days > 30) {
      throw new BadRequestException('days must be between 1 and 30 (Worksection get_events limit)');
    }

    const to = Date.now();
    const from = to - days * 86_400_000;
    const events = (await this.eventsService.findEvents(from, to)).filter((event) => {
      const eventTime = parseWorksectionDate(event.date_added);
      return eventTime >= from && eventTime <= to;
    });

    const eventsByTaskId = new Map<number, WorksectionEvent[]>();
    for (const event of events) {
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
      tags: Object.entries(task.tags ?? {}).map(([id, label]) => ({ id, label })),
      events: events.map((event, index) => ({
        id: `${task.id}-${index}`,
        type: getEventType(event),
        action: event.action,
        date: event.date_added,
        userFrom: event.user_from.name,
        summary: describeEvent(event),
      })),
      ...(task.parent ? { parent: { id: task.parent.id, name: task.parent.name } } : {}),
    };
  }
}
