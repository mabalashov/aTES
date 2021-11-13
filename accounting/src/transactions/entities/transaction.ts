import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Task} from "../../tasks/entities/task";
import {User} from "../../users/entities/user";

export enum Reason {
  TaskAssigned = 'task_assigned',
  TaskUnassigned = 'task_unassigned',
  TaskFinished = 'task_finished',
  Withdrawal = 'withdrawal',
}

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column({nullable: true})
  userVendorId: number;

  // @ManyToOne(() => User, user => user.transactions)
  // user: User;

  @ManyToOne(() => Task, task => task.transactions)
  task: Task;

  @Column({
    type: 'enum',
    enum: Reason,
  })
  reason: Reason;

  @CreateDateColumn()
  created_at: Date;
}