import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // global prefix
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true
    })
  );

  // swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Happy Chat API')
    .setContact('Vladimir Vaca', 'https://example.com', 'ramvlay@gmail.com')
    .setDescription('Backend service for Happy Chat application')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header'
      },
      'access-token'
    )
    .build();

  const openApiDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, openApiDocument);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().then(() => {
  Logger.log('** Server is running **');
});
