import {Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./entities/user";
import {Repository} from "typeorm";
import {UserDto} from "./dto/user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(userDto: UserDto): Promise<User> {
    const user = new User();

    user.vendorId = userDto.id;
    user.role = userDto.role;
    user.username = userDto.username;

    return this.usersRepository.save(user);
  }

  async update(userDto: UserDto): Promise<any> {
    const user = await this.findByVendorId(userDto.id) ?? await this.create(userDto);

    return this.usersRepository.update(user.id, userDto);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findByVendorId(parseInt(id));

    if (!user) {
      return;
    }

    await this.usersRepository.delete(user.id);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ username });
  }

  async findByVendorId(vendorId: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ vendorId });
  }

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ id });
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
