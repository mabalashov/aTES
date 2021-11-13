import {IsEnum, IsNumber, IsString} from 'class-validator';
import {Role} from "../entities/user";

export class UserDto {
  @IsNumber()
  id: number;

  @IsString()
  username: string;

  @IsEnum(Role)
  role: Role;
}
