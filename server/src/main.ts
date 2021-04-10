import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import { swaggerCss } from './_config/swagger-style'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'debug', 'error', 'verbose']
  })
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
  app.useGlobalPipes(new ValidationPipe())

  // Enable swagger docs for NestJS (documentation is available under /docs [on server under /api/docs])
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Geschäftskundenbroker API')
    .setDescription('Die offizielle API für den Geschäftskundenbroker')
    .setVersion('1.0')
    .build()

  const swaggerOptions: SwaggerCustomOptions = {
    customCss: swaggerCss,
    customSiteTitle: 'Business Broker Backend API'
  }

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, swaggerDocument, swaggerOptions)

  // Start NestJS server on port 3000
  await app.listen(3000)
}

// start Nest
bootstrap()
// Start Cronjobs
// CronJobs.runJobs();
