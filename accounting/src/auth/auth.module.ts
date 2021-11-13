import { Module } from '@nestjs/common';
import {PassportModule} from "@nestjs/passport";
import {UsersModule} from "../users/users.module";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {JwtModule} from "@nestjs/jwt";
import {ClientsModule, Transport} from "@nestjs/microservices";
import {JwtStrategy} from "./strategies/jwt.strategy";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get('jwt.secret'),
        };
      },
    }),

    ClientsModule.register([
      {
        name: 'AUTH_MODULE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'auth',
            brokers: ['ates_broker:29092'],
          },
          consumer: {
            groupId: 'auth-consumer',
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  providers: [JwtStrategy],
  exports: [AuthModule],
})
export class AuthModule {}
