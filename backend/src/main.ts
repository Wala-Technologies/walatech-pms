import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:3001',
      'http://localhost:3001',
      /^http:\/\/.*\.localhost:3000$/,  // Allow any subdomain on localhost:3000
      /^http:\/\/.*\.localhost:3001$/,  // Allow any subdomain on localhost:3001
      /^http:\/\/.*\.localhost:3001$/   // Allow any subdomain on localhost:3001
    ],
    credentials: true,
  });
  
  // Global prefix for API routes
  app.setGlobalPrefix('api');
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  const port = configService.get('PORT', 3001);
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
}
bootstrap();
