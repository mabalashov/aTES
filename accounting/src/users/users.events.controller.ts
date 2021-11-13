import {EventPattern} from "@nestjs/microservices";
import {Controller, Inject} from "@nestjs/common";
import {UserDto} from "./dto/user.dto";
import {UsersService} from "./users.service";
import {SchemaRegistry} from "@kafkajs/confluent-schema-registry";
import {FailedMessagesService} from "../failed-messages/failed-messages.service";

@Controller()
export class UsersEventsController {
  constructor(
    private readonly userService: UsersService,
    private failedMessagesService: FailedMessagesService,
    @Inject('SCHEMA_REGISTRY') private readonly schemaRegistry: SchemaRegistry,
  ) {
  }

  @EventPattern('user-created-event')
  async createUser(message: any) {
    const payload = await this.schemaRegistry.decode(message.value);
    try {
      return this.userService.create(payload as UserDto);
    } catch (e) {
      await this.failedMessagesService.create('user-created-event', message, e);
    }
  }

  @EventPattern('user-updated-event')
  async updateUser(message: any) {
    const payload = await this.schemaRegistry.decode(message.value);
    try {
      return this.userService.update(payload as UserDto);
    } catch (e) {
      await this.failedMessagesService.create('user-updated-event', message, e);
    }
  }

  @EventPattern('user-deleted-event')
  async removeUser(message: any) {
    const payload = await this.schemaRegistry.decode(message.value);
    try {
      return this.userService.remove(payload.id);
    } catch (e) {
      await this.failedMessagesService.create('user-deleted-event', message, e);
    }
  }
}