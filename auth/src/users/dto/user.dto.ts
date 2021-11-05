import {IsEnum, IsString} from 'class-validator';
import {Role} from "../entities/user";

export class UserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsEnum(Role)
  role: Role;
}
