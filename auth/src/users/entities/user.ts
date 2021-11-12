import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

export enum Role {
  User = 'user',
  Manager = 'manager',
  Admin = 'admin',
  Accountant = 'accountant',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;
}