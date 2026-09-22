// Shared shape between WorksectionApiTokenService (static admin API key) and WorksectionOAuthService
// (per-connection OAuth token), so callers don't need to know which auth method is active.
export interface WorksectionClient {
  request<T>(action: string, params?: Record<string, string>): Promise<T>;
}

export const WORKSECTION_CLIENT = Symbol('WORKSECTION_CLIENT');
