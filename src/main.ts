import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.HEADER,
    header: '1',
  });
  const config = new DocumentBuilder()
    .setTitle("Tuproqqal'a TAKM api V1")
    .setDescription("Tuproqqal'a TAKM Axborot kutubxona markazi api.")
    .addBearerAuth()
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory);
  await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
}
bootstrap();
