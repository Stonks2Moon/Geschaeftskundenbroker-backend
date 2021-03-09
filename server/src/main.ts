import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS for all hosts (regex is used instead of wildcard, because only wildcard does not work properly)
  app.enableCors({
    origin: [
      /^(.*)/,
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 200,
    credentials: true,
    allowedHeaders:
      'Origin,X-Requested-With,Content-Type,Accept,Authorization,authorization,X-Forwarded-for',
  })

  // Enable validation via nestJS's validator decorators
  // (used to validate data which is an input of the API)
  app.useGlobalPipes(new ValidationPipe());

  // Enable swagger docs for NestJS (documentation is available under /docs [on server under /api/docs])
  const config = new DocumentBuilder()
    .setTitle('Geschäftskundenbroker API')
    .setDescription('Die offizielle API für den Geschäftskundenbroker')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Start NestJS server on port 3000
  await app.listen(3000);
}
bootstrap();
