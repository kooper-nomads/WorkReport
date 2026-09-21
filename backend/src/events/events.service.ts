import { BadRequestException, Injectable } from '@nestjs/common';
import { WorksectionService } from '../worksection/worksection.service.js';
import type { WorksectionEvent, WorksectionResponse } from '../worksection/worksection.types.js';

@Injectable()
export class EventsService {
  constructor(private readonly worksectionService: WorksectionService) {}

  // Temporary: reads straight from Worksection's get_events. Always fetches the full 30-day
  // rolling window (Worksection's own limit) rather than tailoring it to `from`/`to`, so
  // callers can look further back than the requested range to reconstruct state that predates
  // it (e.g. "was this task already assigned when the window opened"). `from`/`to` are
  // validated here but no longer used to clip the result — callers filter by date themselves.
  // Once webhook events are persisted into our own DB, this should query that store instead
  // and drop the 30-day ceiling — see the "Webhooks→DB migration plan" note.
  async findEvents(from: number, to: number): Promise<WorksectionEvent[]> {
    if (from >= to) {
      throw new BadRequestException('"from" must be before "to"');
    }

    const now = Date.now();
    if (now - from <= 0) {
      throw new BadRequestException('"from" must be in the past');
    }
    if (now - from > 30 * 86_400_000) {
      throw new BadRequestException('"from" cannot be more than 30 days ago (Worksection get_events limit)');
    }

    const eventsResponse = await this.worksectionService.request<WorksectionResponse<WorksectionEvent[]>>(
      'get_events',
      { period: '30d' },
    );

    return eventsResponse.data;
  }
}
