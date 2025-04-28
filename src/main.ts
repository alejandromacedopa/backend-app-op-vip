import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  // Habilitar CORS con encabezados personalizados
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key'],
    origin: '*', // O especifica las URLs permitidas
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });
  // Usar body-parser para limitar el tamaño del JSON de la solicitud
  app.use(bodyParser.json({ limit: '10mb' })); // Límite de 10 MB
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // Para datos formateados como URL
  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: false }));
  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: false })); //activar las validaciones
  await app.listen(3000, 'localhost');
}
bootstrap();
