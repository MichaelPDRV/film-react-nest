import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import * as path from 'node:path';

import { configProvider } from './app.config.provider';
import { FilmsController } from './films/films.controller';
import { OrderController } from './order/order.controller';
import { FilmsService } from './films/films.service';
import { OrderService } from './order/order.service';
import { FilmsRepositoryMongo } from './repository/films-mongodb.repository';
import { FilmsRepositoryPostgres } from './repository/films-postgresql.repository';
import { Film as FilmMongo, FilmSchema } from './repository/film.schema';
import { Film as FilmEntity } from './repository/entity/film.entity';
import { Session as SessionEntity } from './repository/entity/session.entity';

// Определяем, какую базу данных использовать
const databaseDriver = process.env.DATABASE_DRIVER || 'mongodb';
console.log(`Загружается конфигурация для: ${databaseDriver}`);

// Создаем базовые импорты
const baseImports: DynamicModule[] = [
  ConfigModule.forRoot({
    isGlobal: true,
    cache: true,
  }) as DynamicModule,
  ServeStaticModule.forRoot({
    rootPath: path.join(__dirname, '..', 'public', 'content'),
    serveRoot: '/content',
  }) as DynamicModule,
];

// Создаем базовые провайдеры
const baseProviders: Provider[] = [
  configProvider as Provider,
  FilmsService,
  OrderService,
];

let databaseImports: DynamicModule[] = [];
let databaseProviders: Provider[] = [];

if (databaseDriver === 'mongodb') {
  // Конфигурация для MongoDB
  databaseImports = [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const config = {
          uri: configService.get<string>(
            'DATABASE_URL',
            'mongodb://localhost:27017/afisha',
          ),
        };
        console.log('Конфигурация MongoDB:', config);
        return config;
      },
      inject: [ConfigService],
    }) as DynamicModule,
    MongooseModule.forFeature([
      { name: FilmMongo.name, schema: FilmSchema },
    ]) as DynamicModule,
  ];

  databaseProviders = [
    FilmsRepositoryMongo,
    {
      provide: 'IFilmsRepository',
      useClass: FilmsRepositoryMongo,
    },
  ];
} else if (databaseDriver === 'postgres') {
  // Конфигурация для PostgreSQL
  databaseImports = [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const config: PostgresConnectionOptions = {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST', 'localhost'),
          port: configService.get<number>('DATABASE_PORT', 5432),
          username: configService.get<string>('DATABASE_USERNAME', 'prac'),
          password: configService.get<string>('DATABASE_PASSWORD', 'prac'),
          database: configService.get<string>('DATABASE_NAME', 'prac'),
          entities: [FilmEntity, SessionEntity],
          synchronize: configService.get<boolean>(
            'DATABASE_SYNCHRONIZE',
            false,
          ),
        };
        console.log('Конфигурация PostgreSQL:', config);
        return config;
      },
      inject: [ConfigService],
    }) as DynamicModule,
    TypeOrmModule.forFeature([FilmEntity, SessionEntity]) as DynamicModule,
  ];

  databaseProviders = [
    FilmsRepositoryPostgres,
    {
      provide: 'IFilmsRepository',
      useClass: FilmsRepositoryPostgres,
    },
  ];
} else {
  console.error('Неизвестный драйвер базы данных:', databaseDriver);
}

@Module({
  imports: [...baseImports, ...databaseImports],
  controllers: [FilmsController, OrderController],
  providers: [...baseProviders, ...databaseProviders],
})
export class AppModule {}
