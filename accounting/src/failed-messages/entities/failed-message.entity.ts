import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({ name: 'failed-messages' })
export class FailedMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pattern: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: any;

  @Column({ type: 'jsonb', nullable: true })
  error: any;

}