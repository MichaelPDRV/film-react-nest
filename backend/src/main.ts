import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';
import { DevLogger } from './logger/dev.logger';
import { JsonLogger } from './logger/json.logger';
import { TskvLogger } from './logger/tskv.logger';

async function bootstrap() {
  const loggerType = process.env.LOGGER_TYPE || 'dev';

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  let logger;

  switch (loggerType) {
    case 'json':
      logger = new JsonLogger();
      break;
    case 'tskv':
      logger = new TskvLogger();
      break;
    case 'dev':
    default:
      logger = new DevLogger();
      break;
  }

  app.useLogger(logger);

  app.setGlobalPrefix('api/afisha');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(3000);

  logger.log(`Приложение запущено с ${loggerType} логгером`);
}
bootstrap();
