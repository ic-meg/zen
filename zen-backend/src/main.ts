import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable global validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove properties that are not in the DTO
    forbidNonWhitelisted: true, // Throw error if unknown properties are sent
    transform: true, // Enable transformation
  }));
  
  // Enable CORS for frontend communication
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
