import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { WorksectionApiException } from '../worksection/worksection.exceptions.js';
import { WorksectionNotConnectedException } from '../worksection/worksection-not-connected.exception.js';
import type { WorksectionClient } from '../worksection/worksection-client.interface.js';

const OAUTH_BASE_URL = 'https://worksection.com/oauth2';
// Worksection enforces 1 request/second per account and returns no Retry-After or structured
// status code for it — mirrors WorksectionApiTokenService's throttling, duplicated rather than shared
// since that module is intentionally left untouched.
const MIN_REQUEST_INTERVAL_MS = 1000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;
// Refresh a bit before actual expiry so an in-flight request never races token death.
const EXPIRY_SAFETY_MARGIN_MS = 60_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface OAuthTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
  account_url: string;
}

interface OAuthProfileResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  account_url: string;
}

export interface WorksectionConnectionStatus {
  email: string;
  firstName: string;
  lastName: string;
  accountUrl: string;
}

@Injectable()
export class WorksectionOAuthService implements WorksectionClient {
  private queue: Promise<void> = Promise.resolve();
  private lastRequestAt = 0;

  // Unlike WorksectionApiTokenService, credentials aren't validated eagerly in the constructor: this
  // service is always wired into AuthModule (so /auth/status works regardless of which auth
  // method is active), so it must tolerate WORKSECTION_OAUTH_CLIENT_ID/SECRET being unset when
  // WORKSECTION_AUTH_METHOD=api_key. They're required lazily, only once OAuth is actually used.
  constructor(private readonly prisma: PrismaService) {}

  private get credentials(): { clientId: string; clientSecret: string } {
    const clientId = process.env.WORKSECTION_OAUTH_CLIENT_ID;
    const clientSecret = process.env.WORKSECTION_OAUTH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('WORKSECTION_OAUTH_CLIENT_ID and WORKSECTION_OAUTH_CLIENT_SECRET must be set in env');
    }

    return { clientId, clientSecret };
  }

  async request<T>(action: string, params: Record<string, string> = {}): Promise<T> {
    return this.enqueue(() => this.requestWithRetry<T>(action, params));
  }

  // Exchanges an authorization code for tokens, fetches the profile of whoever authorized, and
  // persists it as the app's single Worksection connection.
  async exchangeCode(code: string, redirectUri: string): Promise<void> {
    const { clientId, clientSecret } = this.credentials;
    const token = await this.postForm<OAuthTokenResponse>(`${OAUTH_BASE_URL}/token`, {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });
    const profile = await this.postForm<OAuthProfileResponse>(`${OAUTH_BASE_URL}/resource`, {
      client_id: clientId,
      client_secret: clientSecret,
      access_token: token.access_token,
    });

    await this.saveConnection(token, profile);
  }

  // There is only ever one shared connection, so disconnecting removes it for every viewer.
  async disconnect(): Promise<void> {
    await this.prisma.worksectionConnection.deleteMany({});
  }

  async getStatus(): Promise<WorksectionConnectionStatus | null> {
    const connection = await this.prisma.worksectionConnection.findUnique({ where: { id: 1 } });
    if (!connection) {
      return null;
    }

    return {
      email: connection.email,
      firstName: connection.firstName,
      lastName: connection.lastName,
      accountUrl: connection.accountUrl,
    };
  }

  private async saveConnection(token: OAuthTokenResponse, profile: OAuthProfileResponse): Promise<void> {
    const expiresAt = new Date(Date.now() + token.expires_in * 1000);
    const data = {
      accountUrl: token.account_url,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt,
      worksectionUserId: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
    };

    await this.prisma.worksectionConnection.upsert({
      where: { id: 1 },
      create: { id: 1, ...data },
      update: data,
    });
  }

  // Returns the current connection, refreshing its tokens first if they're at/near expiry. The
  // refresh call invalidates the old tokens, so this must happen before use, not reactively.
  private async getFreshConnection() {
    const connection = await this.prisma.worksectionConnection.findUnique({ where: { id: 1 } });
    if (!connection) {
      throw new WorksectionNotConnectedException();
    }

    if (connection.expiresAt.getTime() - EXPIRY_SAFETY_MARGIN_MS > Date.now()) {
      return connection;
    }

    const { clientId, clientSecret } = this.credentials;
    const refreshed = await this.postForm<OAuthTokenResponse>(`${OAUTH_BASE_URL}/refresh`, {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: connection.refreshToken,
    });

    return this.prisma.worksectionConnection.update({
      where: { id: 1 },
      data: {
        accountUrl: refreshed.account_url,
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token,
        expiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
      },
    });
  }

  // Serializes all outbound calls at least MIN_REQUEST_INTERVAL_MS apart, regardless of how many
  // callers invoke request() concurrently.
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
    const connection = await this.getFreshConnection();
    const query = new URLSearchParams({ action, ...params }).toString();
    const url = `${connection.accountUrl.replace(/\/+$/, '')}/api/oauth2?${query}`;

    let response: Response;
    try {
      response = await fetch(url, { headers: { Authorization: `Bearer ${connection.accessToken}` } });
    } catch (error) {
      // Network failures (DNS, connection reset, timeout) are transient by nature.
      throw new WorksectionApiException(action, error instanceof Error ? error.message : 'network error', true);
    }

    if (!response.ok) {
      // Only 5xx is worth retrying; a 4xx will fail identically again.
      throw new WorksectionApiException(action, `${response.status} ${response.statusText}`, response.status >= 500);
    }

    const body = (await response.json()) as { status?: 'ok' | 'error'; message?: string };
    if (body.status === 'error') {
      throw new WorksectionApiException(action, body.message ?? 'unknown error');
    }

    return body as T;
  }

  private async postForm<T>(url: string, params: Record<string, string>): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params).toString(),
    });

    if (!response.ok) {
      throw new WorksectionApiException('oauth', `${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  }
}
