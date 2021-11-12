import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ClientsModule, Transport} from "@nestjs/microservices";
import {TasksService} from "./tasks.service";
import {Task} from "./entities/task";
import {UsersModule} from "../users/users.module";
import {TasksController} from "./tasks.controller";
import {TasksEventsController} from "./tasks.events.controller";
import {FailedMessagesModule} from "../failed-messages/failed-messages.module";

@Module({
  providers: [TasksService],
  exports: [TasksService],
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Task]),
    FailedMessagesModule,

    ClientsModule.register([
      {
        name: 'TASK_MODULE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'task-task',
            brokers: ['ates_broker:29092'],
          },
          consumer: {
            groupId: 'task-task-consumer',
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  controllers: [TasksController, TasksEventsController],
})
export class TasksModule {}
