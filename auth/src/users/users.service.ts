import {Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./entities/user";
import {Repository} from "typeorm";
import {UserDto} from "./dto/user.dto";
import {ClientKafka} from "@nestjs/microservices";
import {SchemaRegistry} from "@kafkajs/confluent-schema-registry";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject('USER_MODULE') private readonly client: ClientKafka,
    @Inject('SCHEMA_REGISTRY') private readonly schemaRegistry: SchemaRegistry,
  ) {
  }

  async create(user: User): Promise<User> {
    const resp = await this.usersRepository.save(user);

    const schemaId = await this.schemaRegistry.getRegistryId('user_created_event', 1);
    const payload = {
      id: resp.id,
      username: resp.username,
      role: resp.role
    };

    this.client.emit<number>('user-created-event',
      await this.schemaRegistry.encode(schemaId, payload),
    );

    return resp;
  }

  async update(id: number, userDto: UserDto): Promise<any> {
    const resp = await this.usersRepository.update(id, userDto);

    const schemaId = await this.schemaRegistry.getRegistryId('user_updated_event', 1);
    const payload = {
      id,
      username: userDto.username,
      role: userDto.role
    };

    this.client.emit<number>('user-updated-event',
      await this.schemaRegistry.encode(schemaId, payload),
    );

    return resp;
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User> {
    return this.usersRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);


    const schemaId = await this.schemaRegistry.getRegistryId('user_deleted_event', 1);
    const payload = {
      id,
    };

    this.client.emit<number>('user-deleted-event',
      await this.schemaRegistry.encode(schemaId, payload),
    );
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ username });
  }
}
