import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {FailedMessagesModule} from "../failed-messages/failed-messages.module";
import {ClientsModule, Transport} from "@nestjs/microservices";
import {Transaction} from "./entities/transaction";
import {User} from "../users/entities/user";
import {UserDaily} from "./entities/user-daily";
import {Task} from "../tasks/entities/task";

@Module({
  providers: [TransactionsService],
  exports: [TransactionsService],
  imports: [
    TypeOrmModule.forFeature([Transaction, User, UserDaily, Task]),
    FailedMessagesModule,

    ClientsModule.register([
      {
        name: 'TRANSACTION_MODULE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'accounting-transaction',
            brokers: ['ates_broker:29092'],
          },
          consumer: {
            groupId: 'accounting-transaction-consumer',
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  controllers: [TransactionsController]
})
export class TransactionsModule {}
