import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { WorksectionModule } from './worksection/worksection.module.js';

@Module({
  imports: [WorksectionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
