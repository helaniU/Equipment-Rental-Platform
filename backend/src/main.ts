import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  // 1. Pass NestExpressApplication generic type to expose express methods like useStaticAssets
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security
  // Note: crossOriginResourcePolicy is set to cross-origin so static files like PDFs/Images can be fetched by frontend clients
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.enableCors({
    origin: true, // allows dynamic origin matching for local dev
    credentials: true,
  });

  // Serve static files from the 'uploads' directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Global DTO Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger OpenAPI Setup
  const config = new DocumentBuilder()
    .setTitle('Equipment Rental API')
    .setDescription('Enterprise Grade Equipment Rental Management Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`Application running on http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}
bootstrap();