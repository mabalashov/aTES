import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entities/user";

@Entity({ name: 'user-daily' })
export class UserDaily {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  // @ManyToOne(() => User, user => user.dailies)
  // user: User;

  @CreateDateColumn()
  date: Date;
}