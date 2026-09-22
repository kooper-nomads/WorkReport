import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { WorksectionApiException } from './worksection.exceptions.js';

// Worksection enforces 1 request/second per account and returns no Retry-After or
// structured status code for it — so we throttle proactively instead of reacting to errors.
const MIN_REQUEST_INTERVAL_MS = 1000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class WorksectionService {
  private readonly accountUrl: string;
  private readonly apiKey: string;
  private queue: Promise<void> = Promise.resolve();
  private lastRequestAt = 0;

  constructor() {
    const accountUrl = process.env.WORKSECTION_ACCOUNT_URL;
    const apiKey = process.env.WORKSECTION_API_KEY;

    if (!accountUrl || !apiKey) {
      throw new Error('WORKSECTION_ACCOUNT_URL and WORKSECTION_API_KEY must be set in env');
    }

    this.accountUrl = accountUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
  }

  async request<T>(action: string, params: Record<string, string> = {}): Promise<T> {
    return this.enqueue(() => this.requestWithRetry<T>(action, params));
  }

  // Serializes all outbound calls at least MIN_REQUEST_INTERVAL_MS apart, regardless of how
  // many callers invoke request() concurrently.
  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const wait = this.queue.then(async () => {
      const remaining = this.lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now();
      if (remaining > 0) {
        await sleep(remaining);
      }
      this.lastRequestAt = Date.now();
    });
    this.queue = wait;
    return wait.then(fn);
  }

  private async requestWithRetry<T>(action: string, params: Record<string, string>, attempt = 0): Promise<T> {
    try {
      return await this.performRequest<T>(action, params);
    } catch (error) {
      const retryable = error instanceof WorksectionApiException && error.retryable;
      if (!retryable || attempt >= MAX_RETRIES) {
        throw error;
      }
      await sleep(RETRY_DELAY_MS);
      return this.requestWithRetry<T>(action, params, attempt + 1);
    }
  }

  private async performRequest<T>(action: string, params: Record<string, string>): Promise<T> {
    const query = new URLSearchParams({ action, ...params }).toString();
    const hash = createHash('md5')
      .update(query + this.apiKey)
      .digest('hex');
    const url = `${this.accountUrl}/api/admin/v2/?${query}&hash=${hash}`;
    let response: Response;
    try {
      response = await fetch(url);
    } catch (error) {
      // Network failures (DNS, connection reset, timeout) are transient by nature.
      throw new WorksectionApiException(action, error instanceof Error ? error.message : 'network error', true);
    }

    if (!response.ok) {
      // Only 5xx is worth retrying; a 4xx (e.g. 414 URI too large) will fail identically again.
      throw new WorksectionApiException(action, `${response.status} ${response.statusText}`, response.status >= 500);
    }

    const body = (await response.json()) as { status?: 'ok' | 'error'; message?: string };
    if (body.status === 'error') {
      // An application-level error from Worksection (bad params, "too many tasks", etc.) will
      // recur on retry, so it's surfaced immediately rather than retried.
      throw new WorksectionApiException(action, body.message ?? 'unknown error');
    }

    return body as T;
  }
}
