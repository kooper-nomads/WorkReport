import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { WorksectionModule } from './worksection/worksection.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [WorksectionModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
