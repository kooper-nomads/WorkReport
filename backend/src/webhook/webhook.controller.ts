import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('webhooks')
@SkipThrottle()
export class WebhookController {
  @Post()
  @HttpCode(200)
  receive(@Body() body: unknown, @Headers() headers: Record<string, string>): { status: string } {
    console.log(
      `[${new Date().toISOString()}] Webhook headers: ${JSON.stringify(headers)}\nWebhook body: ${JSON.stringify(body)}`,
    );
    return { status: 'OK' };
  }
}
