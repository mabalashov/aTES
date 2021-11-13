import { Module } from '@nestjs/common';
import { FailedMessagesService } from './failed-messages.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {FailedMessage} from "./entities/failed-message.entity";

@Module({
  providers: [FailedMessagesService],
  exports: [FailedMessagesService],
  imports: [
    TypeOrmModule.forFeature([FailedMessage]),
  ]
})
export class FailedMessagesModule {}
