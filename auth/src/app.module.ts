import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from './health/health.controller';
import { HealthModule } from "./health/health.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import databaseConfig from "./config/database";
import jwtConfig from "./config/jwt";
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import {TypeOrmModule} from "@nestjs/typeorm";
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

const typeOrmFactory = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  return Object.assign({}, configService.get('database'));
};

@Module({
  imports: [
    TerminusModule,
    HealthModule,
    ConfigModule.forRoot({
      load: [databaseConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmFactory,
    }),
    AuthModule,
    UsersModule
  ],
  controllers: [HealthController],
  providers: [AppService],
})
export class AppModule {}
