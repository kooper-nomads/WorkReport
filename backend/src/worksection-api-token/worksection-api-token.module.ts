import { Module } from '@nestjs/common';
import { WorksectionApiTokenService } from './worksection-api-token.service.js';

@Module({
  providers: [WorksectionApiTokenService],
  exports: [WorksectionApiTokenService],
})
export class WorksectionApiTokenModule {}
