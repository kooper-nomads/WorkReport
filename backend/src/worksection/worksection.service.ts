import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createHash } from 'node:crypto';

@Injectable()
export class WorksectionService {
  private readonly accountUrl: string;
  private readonly apiKey: string;

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
    const query = new URLSearchParams({ action, ...params }).toString();
    const hash = createHash('md5')
      .update(query + this.apiKey)
      .digest('hex');
    const url = `${this.accountUrl}/api/admin/v2/?${query}&hash=${hash}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new InternalServerErrorException(
        `Worksection API request "${action}" failed: ${response.status} ${response.statusText}`,
      );
    }

    return (await response.json()) as T;
  }
}
