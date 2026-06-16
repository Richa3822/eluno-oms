import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://eluno-oms-five.vercel.app',
      'https://eluno-oms-git-main-richa-s-projects7.vercel.app',
    ],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();