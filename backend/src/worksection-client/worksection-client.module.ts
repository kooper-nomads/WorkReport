import { Module } from '@nestjs/common';
import { WorksectionApiTokenModule } from '../worksection-api-token/worksection-api-token.module.js';
import { WorksectionApiTokenService } from '../worksection-api-token/worksection-api-token.service.js';
import { WORKSECTION_CLIENT } from '../worksection/worksection-client.interface.js';
import { WorksectionOAuthModule } from '../worksection-oauth/worksection-oauth.module.js';
import { WorksectionOAuthService } from '../worksection-oauth/worksection-oauth.service.js';

// Picks which Worksection client implementation the app actually uses, based on
// WORKSECTION_AUTH_METHOD (api_key | oauth), and binds it to a shared WORKSECTION_CLIENT token so
// TasksModule/UsersModule don't need to know which one is active.
const isOAuth = process.env.WORKSECTION_AUTH_METHOD === 'oauth';

@Module({
  imports: [isOAuth ? WorksectionOAuthModule : WorksectionApiTokenModule],
  providers: [
    {
      provide: WORKSECTION_CLIENT,
      useExisting: isOAuth ? WorksectionOAuthService : WorksectionApiTokenService,
    },
  ],
  exports: [WORKSECTION_CLIENT],
})
export class WorksectionClientModule {}
