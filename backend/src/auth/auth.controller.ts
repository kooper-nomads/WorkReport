import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { WorksectionOAuthService, type WorksectionConnectionStatus } from '../worksection-oauth/worksection-oauth.service.js';
import { OAUTH_STATE_COOKIE } from './auth.constants.js';

const OAUTH_STATE_COOKIE_MAX_AGE_MS = 10 * 60 * 1000;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set in env`);
  }
  return value;
}

interface AuthStatus {
  authMethod: 'api_key' | 'oauth';
  platformAuthMethod: 'off' | 'worksection_oauth';
  connected: boolean;
  connection?: WorksectionConnectionStatus;
}

// No browser session/login is tracked here: the app has no per-viewer identity anywhere else
// (/tasks, /users, /auth/status are all unauthenticated), so there's nothing meaningful to gate
// behind "whoever's browser completed the OAuth handshake". These endpoints just manage the
// app's single shared Worksection connection. AUTH_METHOD only decides whether the frontend
// treats "not connected yet" as a login wall (see status() below) — it doesn't change that.
@Controller('auth')
export class AuthController {
  constructor(private readonly worksectionOAuthService: WorksectionOAuthService) {}

  // Step 1 of the OAuth flow: redirect the browser to Worksection's consent screen.
  @Get('worksection/login')
  login(@Res() res: Response): void {
    const state = randomBytes(16).toString('hex');
    res.cookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: OAUTH_STATE_COOKIE_MAX_AGE_MS,
    });

    const authorizeUrl = new URL('https://worksection.com/oauth2/authorize');
    authorizeUrl.searchParams.set('client_id', requireEnv('WORKSECTION_OAUTH_CLIENT_ID'));
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('redirect_uri', requireEnv('WORKSECTION_OAUTH_REDIRECT_URI'));
    authorizeUrl.searchParams.set('state', state);
    authorizeUrl.searchParams.set(
      'scope',
      process.env.WORKSECTION_OAUTH_SCOPE ?? 'projects_read tasks_read costs_read tags_read comments_read files_read users_read contacts_read',
    );

    res.redirect(authorizeUrl.toString());
  }

  // Step 2: Worksection redirects back here with `code`. Exchange it and persist the connection.
  // Failures redirect back to the frontend with an error flag instead of a dead-end JSON error
  // page: an invalid/expired state is expected whenever a login is retried or reopened in another
  // tab (the single-use CSRF cookie gets overwritten/consumed), so it should be easy to just try
  // again rather than a hard stop.
  @Get('worksection/callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = (process.env.FRONTEND_URL ?? '').split(',')[0]?.trim() || '/';
    const expectedState = req.cookies?.[OAUTH_STATE_COOKIE] as string | undefined;
    res.clearCookie(OAUTH_STATE_COOKIE);

    if (!code || !state || !expectedState || state !== expectedState) {
      res.redirect(`${frontendUrl}?worksectionAuthError=state`);
      return;
    }

    try {
      await this.worksectionOAuthService.exchangeCode(code, requireEnv('WORKSECTION_OAUTH_REDIRECT_URI'));
    } catch {
      res.redirect(`${frontendUrl}?worksectionAuthError=exchange`);
      return;
    }

    res.redirect(frontendUrl);
  }

  // Tells the frontend which auth method the backend uses for Worksection API calls
  // (authMethod), whether the platform itself requires a Worksection login before showing the
  // report (platformAuthMethod), and whether the shared Worksection connection is established
  // (connected) — needed for either purpose, so it's fetched whenever either is oauth-based.
  @Get('status')
  async status(): Promise<AuthStatus> {
    const authMethod = process.env.WORKSECTION_AUTH_METHOD === 'oauth' ? 'oauth' : 'api_key';
    const platformAuthMethod = process.env.AUTH_METHOD === 'worksection_oauth' ? 'worksection_oauth' : 'off';

    if (authMethod !== 'oauth' && platformAuthMethod !== 'worksection_oauth') {
      return { authMethod, platformAuthMethod, connected: false };
    }

    const connection = await this.worksectionOAuthService.getStatus();
    return { authMethod, platformAuthMethod, connected: connection !== null, connection: connection ?? undefined };
  }

  // Disconnects the app's single shared Worksection connection, for everyone.
  @Post('logout')
  async logout(@Res() res: Response): Promise<void> {
    await this.worksectionOAuthService.disconnect();
    res.status(204).send();
  }
}
