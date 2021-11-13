import { Injectable } from '@nestjs/common';
import {Repository} from "typeorm";
import {FailedMessage} from "./entities/failed-message.entity";
import {InjectRepository} from "@nestjs/typeorm";

@Injectable()
export class FailedMessagesService {
  constructor(
    @InjectRepository(FailedMessage) private readonly failedMessageRepository: Repository<FailedMessage>
  ) {
  }

  async create(pattern: string, message: object|null, error: object) {
    const failedMessage = new FailedMessage();

    failedMessage.pattern = pattern;
    failedMessage.payload = message;
    failedMessage.error = error;

    await this.failedMessageRepository.save(failedMessage);
  }
}

