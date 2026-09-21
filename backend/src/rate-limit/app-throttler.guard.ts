import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  // There is no authentication yet, so requests are tracked by IP. Once an
  // authenticated user is available on the request, key by user id instead
  // so the limit follows the user rather than their network address.
  protected override async getTracker(req: Record<string, any>): Promise<string> {
    return req.ip;
  }
}
