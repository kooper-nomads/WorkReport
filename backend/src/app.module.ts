import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { WorksectionModule } from './worksection/worksection.module.js';
import { UsersModule } from './users/users.module.js';
import { ReportModule } from './report/report.module.js';
import { WebhookModule } from './webhook/webhook.module.js';
import { AppThrottlerGuard } from './rate-limit/app-throttler.guard.js';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 100 }],
    }),
    WorksectionModule,
    UsersModule,
    ReportModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AppThrottlerGuard }],
})
export class AppModule {}
