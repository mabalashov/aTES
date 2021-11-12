import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Task} from "../../tasks/entities/task";

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
  vendorId: number;

  @Column()
  username: string

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;

  @OneToMany(() => Task, task => task.user)
  tasks: Task[];
}