import { ConfigModule, ConfigService } from '@nestjs/config';

export const configProvider = {
  imports: [ConfigModule.forRoot()],
  provide: 'CONFIG',
  useFactory: (configService: ConfigService): AppConfig => ({
    database: {
      driver: configService.get<string>('DATABASE_DRIVER', 'mongodb'),
      url: configService.get<string>(
        'DATABASE_URL',
        'mongodb://localhost:27017/afisha',
      ),
      host: configService.get<string>('DATABASE_HOST', 'localhost'),
      port: configService.get<number>('DATABASE_PORT', 5432),
      username: configService.get<string>('DATABASE_USERNAME', 'prac'),
      password: configService.get<string>('DATABASE_PASSWORD', 'prac'),
      database: configService.get<string>('DATABASE_NAME', 'prac'),
    },
  }),
  inject: [ConfigService],
};

export interface AppConfig {
  database: AppConfigDatabase;
}

export interface AppConfigDatabase {
  driver: string;
  url: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}
