import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Transaction} from "../../transactions/entities/transaction";

@Entity({name: 'tasks'})
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vendorId: number;

  @Column({nullable: true})
  jiraId: string;

  @Column()
  description: string;

  // task is ready to be assigned
  @Column()
  isReady: boolean;

  @Column()
  isFinished: boolean;

  @Column({nullable: true})
  assignPrice: number;

  @Column({nullable: true})
  completePrice: number;

  @Column({nullable: true})
  userVendorId: number;

  @OneToMany(() => Transaction, transaction => transaction.task)
  transactions: Transaction[];
}