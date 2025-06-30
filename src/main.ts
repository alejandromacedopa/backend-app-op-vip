import { NestFactory } from '@nestjs/core';
import * as crypto from 'crypto';
(global as any).crypto = crypto; // Agrega el módulo a global
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key'],
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
      validationError: {
        target: false,
        value: true,
      },
    })
  );
  
  //3001 port 
  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: false }));
  app.use(cors());
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
