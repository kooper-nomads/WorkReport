import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const origin = (process.env.FRONTEND_URL ?? '').split(',').map((url) => url.trim());
  app.enableCors({ origin, credentials: true });
  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
