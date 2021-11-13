import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";

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

  @Column({ default: 0 })
  amount: number;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;

  // @OneToMany(() => Transaction, transaction => transaction.task)
  // transactions: Transaction[];

  // @OneToMany(() => UserDaily, daily => daily.user)
  // dailies: UserDaily[];
}