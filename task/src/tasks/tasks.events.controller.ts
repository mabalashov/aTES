import {Controller, Inject} from "@nestjs/common";
import {TasksService} from "./tasks.service";
import {EventPattern} from "@nestjs/microservices";
import {SchemaRegistry} from "@kafkajs/confluent-schema-registry";
import {FailedMessagesService} from "../failed-messages/failed-messages.service";

@Controller()
export class TasksEventsController {
  constructor(
    private readonly taskService: TasksService,
    private failedMessagesService: FailedMessagesService,
    @Inject('SCHEMA_REGISTRY') private readonly schemaRegistry: SchemaRegistry,
  ) {
  }

  @EventPattern('task-created-event')
  async taskCreated(message: any) {
    const payload = await this.schemaRegistry.decode(message.value);
    try {
      await this.taskService.generateTaskPrice(payload.id);
    } catch (e) {
      await this.failedMessagesService.create('task-created-event', message, e);
    }
  }

  @EventPattern('task-unassigned-event')
  async taskUnassigned() {
    await this.taskService.checkAllTasksUnassigned();
  }

  @EventPattern('all-tasks-unassigned-event')
  async allTasksUnassigned() {
    await this.taskService.assignTasks();
  }
}