import {Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./entities/user";
import {Repository} from "typeorm";
import {UserDto} from "./dto/user.dto";
import {ClientKafka} from "@nestjs/microservices";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject('USER_MODULE') private readonly client: ClientKafka,
  ) {}

  async create(user: User): Promise<User> {
    const resp = await this.usersRepository.save(user);

    this.client.emit<number>('user-cud', {
      event_name: 'user-created-event',
      payload: {
        id: resp.id,
        username: resp.username,
        role: resp.role
      }
    });

    return resp;
  }

  async update(id: number, userDto: UserDto): Promise<any> {
    const resp = await this.usersRepository.update(id, userDto);

    this.client.emit<number>('user-cud', {
      event_name: 'user-updated-event',
      payload: {
        id,
        username: userDto.username,
        role: userDto.role
      }
    });

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

    this.client.emit<number>('user-cud', {
      event_name: 'user-deleted-event',
      payload: {
        id
      }
    });
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ username });
  }
}
