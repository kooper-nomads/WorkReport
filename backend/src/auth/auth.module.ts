import { Module } from '@nestjs/common';
import { WorksectionOAuthModule } from '../worksection-oauth/worksection-oauth.module.js';
import { AuthController } from './auth.controller.js';

@Module({
  imports: [WorksectionOAuthModule],
  controllers: [AuthController],
})
export class AuthModule {}
