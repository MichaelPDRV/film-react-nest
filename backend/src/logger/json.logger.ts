import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class JsonLogger implements LoggerService {
  private formatMessage(level: string, message: any, ...optionalParams: any[]) {
    return JSON.stringify({
      level,
      timestamp: new Date().toISOString(),
      message,
      optionalParams,
    });
  }
  // Логирование обычных сообщений
  log(message: any, ...optionalParams: any[]) {
    console.log(this.formatMessage('log', message, ...optionalParams));
  }
  // Логирование ошибок
  error(message: any, ...optionalParams: any[]) {
    console.error(this.formatMessage('error', message, ...optionalParams));
  }
  // Логирование предупреждений
  warn(message: any, ...optionalParams: any[]) {
    console.warn(this.formatMessage('warn', message, ...optionalParams));
  }
  // Логирование отладочной информации
  debug(message: any, ...optionalParams: any[]) {
    console.debug(this.formatMessage('debug', message, ...optionalParams));
  }
  // Логирование подробной информации
  verbose(message: any, ...optionalParams: any[]) {
    console.log(this.formatMessage('verbose', message, ...optionalParams));
  }
}
