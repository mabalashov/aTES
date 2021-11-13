import {Inject, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {IsNull, Not, Repository} from "typeorm";
import {Task} from "./entities/task";
import {CreateTaskDto} from "./dto/create.task.dto";
import {User} from "../users/entities/user";
import {UsersService} from "../users/users.service";
import {ClientKafka} from "@nestjs/microservices";
import {SchemaRegistry} from "@kafkajs/confluent-schema-registry";

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
    private usersService: UsersService,
    @Inject('TASK_MODULE') private readonly client: ClientKafka,
    @Inject('SCHEMA_REGISTRY') private readonly schemaRegistry: SchemaRegistry,
  ) {}

  async createTask(dto: CreateTaskDto): Promise<Task> {
    const task = new Task();

    [, task.jiraId, task.description] = /(\[.*])?(.*)/.exec(dto.description);
    task.isFinished = false;
    task.userId = null;
    task.isReady = false;

    const resp = await this.tasksRepository.save(task);
    const schemaId = await this.schemaRegistry.getRegistryId('task_created_event', 2);

    await this.client.emit('task-created-event',
      await this.schemaRegistry.encode(schemaId, {
        id: task.id,
        jiraId: task.jiraId,
        description: task.description,
        isReady: task.isReady,
        isFinished: task.isFinished,
        assignPrice: 0, // workaround. should be null
        completePrice: 0,
        userId: 0,
      }),
    );

    return resp;
  }

  async generateTaskPrice(id: number): Promise<any> {
    const assignPrice: number = Math.floor(Math.random() * 10) + 10;
    const completePrice: number = Math.floor(Math.random() * 20) + 20;

    const schemaId = await this.schemaRegistry.getRegistryId('task_become_ready_event', 1);
    await this.client.emit<number>('task-become-ready-event',
      await this.schemaRegistry.encode(schemaId, { id }),
    );

    await this.tasksRepository.update(id, {
      assignPrice,
      completePrice,
      isReady: true,
    });

    await this.dispatchUpdateEvent(
      await this.tasksRepository.findOne(id),
    );
  }

  async reassignTasks() {
    const tasks = await this.getAssignedTasks();

    if (tasks.length === 0) {
      await this.client.emit<number>('all-tasks-unassigned-event', {});

      return;
    }

    for (const task of tasks) {
      // cutting edge: make parallel
      await this.unassignTask(task);
    }
  }

  async checkAllTasksUnassigned(): Promise<boolean> {
    const assignedCount = await this.getAssignedTasksCount();

    if (assignedCount > 0) {
      return;
    }

    await this.client.emit<number>('all-tasks-unassigned-event', {});
  }

  async assignTasks() {
    const tasks = await this.getUnassignedTasks();
    const users = await this.usersService.findAll();

    const getRandomUser = () => users[Math.floor(Math.random() * users.length)];

    for (const task of tasks) {
      // cutting edge: make parallel
      await this.assignTask(task, getRandomUser());
    }
  }

  async unassignTask(task: Task): Promise<any> {
    const resp = await this.tasksRepository.update(task.id, { userId: null });

    const schemaId = await this.schemaRegistry.getRegistryId('task_unassigned_event', 1);
    await this.client.emit<number>('task-unassigned-event',
      await this.schemaRegistry.encode(schemaId, { id: task.id }),
    );

    await this.dispatchUpdateEvent(
      await this.tasksRepository.findOne(task.id),
    );

    return resp;
  }

  async assignTask(task: Task, user: User): Promise<any> {
    task.user = user;
    const resp = await this.tasksRepository.save(task);

    const schemaId = await this.schemaRegistry.getRegistryId('task_assigned_event', 1);
    await this.client.emit<number>('task-assigned-event',
      await this.schemaRegistry.encode(schemaId, { id: task.id }),
    );

    return resp;
  }

  async isOwner(userVendorId: number, taskId: number): Promise<boolean> {
    const task = await this.findById(taskId);
    const user = await this.usersService.findByVendorId(userVendorId);

    return task.userId === user.id;
  }

  async finishTask(id: number) {
    const resp = await this.tasksRepository.update(id, { isFinished: true });

    const schemaId = await this.schemaRegistry.getRegistryId('task_finished_event', 1);

    await this.client.emit<number>('task-finished-event',
      await this.schemaRegistry.encode(schemaId, { id }),
    );

    await this.dispatchUpdateEvent(
      await this.tasksRepository.findOne(id),
    );

    return resp;
  }

  async getAssignedTasks(): Promise<Task[]> {
    return this.tasksRepository.find({
      where: {
        isFinished: false,
        userId: Not(IsNull())
      },
    });
  }

  async getAssignedTasksCount(): Promise<number> {
    return this.tasksRepository.count({
      where: {
        isFinished: false,
        userId: Not(IsNull())
      },
    });
  }

  async getUnassignedTasks(): Promise<Task[]> {
    return this.tasksRepository.find({
      where: {
        isFinished: false,
        isReady: true,
        userId: IsNull(),
      },
    });
  }

  taskToPayload(task: Task): any
  {
    return Object.getOwnPropertyNames(task)
      .reduce(
        (carry, key) => Object.assign({}, carry, { key: task[key] || null }),
        {}
      );
  }

  findAll(): Promise<Task[]> {
    return this.tasksRepository.find({ relations: ["user"] });
  }

  async findById(id: number): Promise<Task | undefined> {
    return this.tasksRepository.findOne({ id });
  }

  async dispatchUpdateEvent(task: Task) {
    const schemaId = await this.schemaRegistry.getRegistryId('task_updated_event', 1);

    await this.client.emit('task-updated-event',
      await this.schemaRegistry.encode(schemaId, {
        id: task.id,
        jiraId: task.jiraId,
        description: task.description,
        isReady: task.isReady,
        isFinished: task.isFinished,
        assignPrice: task.assignPrice || 0,
        completePrice: task.completePrice || 0,
        userId: task.userId || 0,
      }),
    );
  }
}