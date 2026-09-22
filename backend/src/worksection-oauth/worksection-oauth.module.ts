import { Module } from '@nestjs/common';
import { WorksectionOAuthService } from './worksection-oauth.service.js';

@Module({
  providers: [WorksectionOAuthService],
  exports: [WorksectionOAuthService],
})
export class WorksectionOAuthModule {}
