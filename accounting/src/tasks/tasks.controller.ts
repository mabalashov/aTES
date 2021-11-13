import {Controller, Inject} from '@nestjs/common';
import {FailedMessagesService} from "../failed-messages/failed-messages.service";
import {SchemaRegistry} from "@kafkajs/confluent-schema-registry";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Task} from "./entities/task";
import {EventPattern} from "@nestjs/microservices";
import {TransactionsService} from "../transactions/transactions.service";

@Controller('tasks')
export class TasksController {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    private failedMessagesService: FailedMessagesService,
    @Inject('SCHEMA_REGISTRY') private readonly schemaRegistry: SchemaRegistry,
    private transactionService: TransactionsService,
  ) {
  }

  @EventPattern('task-created-event')
  async createTask(message: any) {
    const payload = await this.schemaRegistry.decode(message.value);
    try {
      const task = new Task();

      task.vendorId = payload.id;
      task.jiraId = payload.jiraId;
      task.description = payload.description;
      task.isReady = payload.isReady;
      task.isFinished = payload.isFinished;
      task.assignPrice = payload.assignPrice;
      task.completePrice = payload.completePrice;
      task.userVendorId = payload.userId;

      return this.taskRepository.save(task);
    } catch (e) {
      await this.failedMessagesService.create('task-created-event', message,
        Object.getOwnPropertyNames(e).reduce((carry, key) => Object.assign(carry, {[key]: e[key]}), {})
      );
    }
  }

  @EventPattern('task-updated-event')
  async updateTask(message: any) {
    const payload = await this.schemaRegistry.decode(message.value);
    try {
      const task = (await this.taskRepository.findOne({ vendorId: payload.id }))
        || new Task();

      task.vendorId = payload.id;
      task.jiraId = payload.jiraId;
      task.description = payload.description;
      task.isReady = payload.isReady;
      task.isFinished = payload.isFinished;
      task.assignPrice = payload.assignPrice;
      task.completePrice = payload.completePrice;
      task.userVendorId = payload.userId;

      return this.taskRepository.save(task);
    } catch (e) {
      await this.failedMessagesService.create('task-updated-event', message,
        Object.getOwnPropertyNames(e).reduce((carry, key) => Object.assign(carry, {[key]: e[key]}), {})
      );
    }
  }

  @EventPattern('task-assigned-event')
  async assignTask(message: any) {
    const payload = await this.schemaRegistry.decode(message.value);

    try {
      const task = await this.taskRepository.findOne({ vendorId: payload.id });

      await this.transactionService.processAssignTask(task);
    } catch (e) {
      await this.failedMessagesService.create('task-assigned-event', message,
        Object.getOwnPropertyNames(e).reduce((carry, key) => Object.assign(carry, {[key]: e[key]}), {})
      );
    }
  }

  @EventPattern('task-finished-event')
  async finishTask(message: any) {
    const payload = await this.schemaRegistry.decode(message.value);

    try {
      const task = await this.taskRepository.findOne({ vendorId: payload.id });

      await this.transactionService.processFinishTask(task);
    } catch (e) {
      await this.failedMessagesService.create('task-finished-event', message,
        Object.getOwnPropertyNames(e).reduce((carry, key) => Object.assign(carry, {[key]: e[key]}), {})
      );
    }
  }

  @EventPattern('task-unassigned-event')
  async unassignTask(message: any) {
    const payload = await this.schemaRegistry.decode(message.value);

    try {
      const task = await this.taskRepository.findOne({ vendorId: payload.id });

      await this.transactionService.processUnassignTask(task);
    } catch (e) {
      await this.failedMessagesService.create('task-unassigned-event', message,
        Object.getOwnPropertyNames(e).reduce((carry, key) => Object.assign(carry, {[key]: e[key]}), {})
      );
    }
  }
}
