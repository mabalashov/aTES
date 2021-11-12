import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entities/user";

@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

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