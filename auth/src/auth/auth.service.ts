import {HttpException, Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {UsersService} from "../users/users.service";
import {USER_ALREADY_EXISTS_ERROR, USER_NOT_FOUND_ERROR, WRONG_PASSWORD_ERROR} from "./auth.constants";
import {compare, genSalt, hashSync} from "bcryptjs";
import {JwtService} from "@nestjs/jwt";
import {ClientKafka} from "@nestjs/microservices";
import {Role, User} from "../users/entities/user";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    // @Inject('AUTH_MODULE') private readonly client: ClientKafka,
  ) {
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new HttpException(...USER_NOT_FOUND_ERROR);
    }

    // const isCorrectPassword = await compare(password, user.password);
    const isCorrectPassword = password === user.password;

    if (!isCorrectPassword) {
      throw new HttpException(...WRONG_PASSWORD_ERROR);
    }

    return user;
  }

  async register(username: string, password: string): Promise<any> {
    const existedUser = await this.usersService.findByUsername(username);

    if (existedUser) {
      throw new HttpException(...USER_ALREADY_EXISTS_ERROR);
    }

    const user = new User();
    user.username = username;
    // user.password = hashSync(password, await genSalt(10));
    user.password = password;
    user.role = Role.User;

    const createdUser = await this.usersService.create(user);

    return this.login(createdUser);
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      role: user.role,
      username: user.username,
    };
    return await this.jwtService.signAsync(payload);
  }
}
