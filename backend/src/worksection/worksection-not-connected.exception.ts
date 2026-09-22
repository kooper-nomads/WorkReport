import { HttpException, HttpStatus } from '@nestjs/common';

// Thrown by WorksectionOAuthService when no WorksectionConnection row exists yet (or its refresh
// token has expired), so callers can surface "please log in" instead of a confusing API error.
export class WorksectionNotConnectedException extends HttpException {
  constructor() {
    super('Not connected to Worksection: log in via /auth/worksection/login first', HttpStatus.UNAUTHORIZED);
  }
}
