import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import {User} from "./entities/user";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ClientsModule, Transport} from "@nestjs/microservices";
import {UsersEventsController} from "./users.events.controller";
import {FailedMessagesModule} from "../failed-messages/failed-messages.module";

@Module({
  providers: [UsersService],
  exports: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User]),
    FailedMessagesModule,

    ClientsModule.register([
      {
        name: 'USER_MODULE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'task-user',
            brokers: ['ates_broker:29092'],
          },
          consumer: {
            groupId: 'task-user-consumer',
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  controllers: [UsersEventsController],
})
export class UsersModule {}
