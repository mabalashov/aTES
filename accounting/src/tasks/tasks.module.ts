import {Module} from '@nestjs/common';
import { TasksService } from './tasks.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {FailedMessagesModule} from "../failed-messages/failed-messages.module";
import {ClientsModule, Transport} from "@nestjs/microservices";
import { TasksController } from './tasks.controller';
import {Task} from "./entities/task";
import {TransactionsModule} from "../transactions/transactions.module";

@Module({
  providers: [TasksService],
  exports: [TasksService],
  imports: [
    TypeOrmModule.forFeature([Task]),
    FailedMessagesModule,
    TransactionsModule,

    ClientsModule.register([
      {
        name: 'TASK_MODULE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'accounting-task',
            brokers: ['ates_broker:29092'],
          },
          consumer: {
            groupId: 'accounting-task-consumer',
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  controllers: [TasksController],
})
export class TasksModule {
}
