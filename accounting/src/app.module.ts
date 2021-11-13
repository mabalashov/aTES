import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import databaseConfig from "./config/database";
import jwtConfig from "./config/jwt";
import schemaRegistryConfig from "./config/schema_registry";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import {AuthModule} from "./auth/auth.module";
import {SchemaRegistryModule} from "./schema-registry/schema-registry.module";
import { FailedMessagesModule } from './failed-messages/failed-messages.module';
import { TasksModule } from './tasks/tasks.module';
import { TransactionsModule } from './transactions/transactions.module';

const typeOrmFactory = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  return Object.assign({}, configService.get('database'));
};

@Module({
  imports: [
    SchemaRegistryModule.forRootAsync(),
    ConfigModule.forRoot({
      load: [databaseConfig, jwtConfig, schemaRegistryConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmFactory,
    }),
    AuthModule,
    FailedMessagesModule,
    TasksModule,
    TransactionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
