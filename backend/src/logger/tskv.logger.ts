import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class TskvLogger implements LoggerService {
  private formatMessage(
    level: string,
    message: any,
    context?: string,
    trace?: string,
  ): string {
    const fields: string[] = [
      `timestamp=${new Date().toISOString()}`,
      `level=${level}`,
      `message=${this.escapeTskvValue(typeof message === 'object' ? JSON.stringify(message) : String(message))}`,
    ];

    if (context) {
      fields.push(`context=${this.escapeTskvValue(context)}`);
    }

    if (trace) {
      fields.push(`trace=${this.escapeTskvValue(trace)}`);
    }

    return fields.join('\t');
  }

  private escapeTskvValue(value: string): string {
    // Экранируем табы, переводы строк и знаки равенства
    return value
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/=/g, '\\=');
  }
  // Логирование обычных сообщений
  log(message: any, context?: string) {
    console.log(this.formatMessage('log', message, context));
  }
  // Логирование ошибок
  error(message: any, trace?: string, context?: string) {
    console.error(this.formatMessage('error', message, context, trace));
  }
  // Логирование предупреждений
  warn(message: any, context?: string) {
    console.warn(this.formatMessage('warn', message, context));
  }
  // Логирование отладочной информации
  debug(message: any, context?: string) {
    console.debug(this.formatMessage('debug', message, context));
  }
  // Логирование подробной информации
  verbose(message: any, context?: string) {
    console.log(this.formatMessage('verbose', message, context));
  }
}
