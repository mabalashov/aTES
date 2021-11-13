import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import {User} from "./entities/user";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ClientsModule, Transport} from "@nestjs/microservices";

@Module({
  providers:
    [
      UsersService,
    ],
  exports: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User]),
    ClientsModule.register([
      {
        name: 'USER_MODULE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'user',
            brokers: ['ates_broker:29092'],
          },
          consumer: {
            groupId: 'user-consumer',
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
})
export class UsersModule {}
