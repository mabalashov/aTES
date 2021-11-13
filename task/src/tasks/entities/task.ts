import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entities/user";

/**
 * I have no specific statuses for assigned and finished tasks
 * Instead of this I use isFinished flag and userId relation
 * So, the task to change the status names from HW #3 is not relevant in my case
 */
@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  jiraId: string;

  @Column()
  description: string;

  // task is ready to be assigned
  @Column()
  isReady: boolean;

  @Column()
  isFinished: boolean;

  @Column({ nullable: true })
  assignPrice: number;

  @Column({ nullable: true })
  completePrice: number;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, user => user.tasks)
  user: User;
}