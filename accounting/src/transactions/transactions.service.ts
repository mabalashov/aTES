import {Injectable} from '@nestjs/common';
import {Task} from "../tasks/entities/task";
import {InjectRepository} from "@nestjs/typeorm";
import {getManager, Repository} from "typeorm";
import {Reason, Transaction} from "./entities/transaction";
import {User} from "../users/entities/user";
import dayjs from "dayjs";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private transactionsRepository: Repository<Transaction>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async processAssignTask(task: Task): Promise<Transaction> {
    const transaction = new Transaction();

    transaction.amount = task.assignPrice * -1;
    transaction.userVendorId = task.userVendorId;
    transaction.task = task;
    transaction.reason = Reason.TaskAssigned;

    return this.saveTransaction(transaction);
  }

  async processUnassignTask(task: Task): Promise<Transaction> {
    const transaction = new Transaction();

    transaction.amount = task.assignPrice;
    transaction.userVendorId = task.userVendorId;
    transaction.task = task;
    transaction.reason = Reason.TaskUnassigned;

    return this.saveTransaction(transaction);
  }

  async processFinishTask(task: Task): Promise<Transaction> {
    const transaction = new Transaction();

    transaction.amount = task.completePrice;
    transaction.userVendorId = task.userVendorId;
    transaction.task = task;
    transaction.reason = Reason.TaskFinished;

    return this.saveTransaction(transaction);
  }

  async processFinishDay(date: Date) {
    const from = dayjs().subtract(1, 'day').startOf('date');
    const to = dayjs().subtract(1, 'day').endOf('date');

    const users = await this.usersRepository.find();

    // for (const user of users) {
    //   await this.transactionsRepository
    //     .createQueryBuilder('transaction')
    //     .where('created_at > :from', { from: from.toDate() })
    //     .where('created_at <= :to', { to: to.toDate() })
    //     .where('userVendorId = :userVendorId', { userVendorId: user.vendorId })
    //     .getMany();
    // }
  }

  async saveTransaction(transaction: Transaction): Promise<Transaction> {
    const user = await this.usersRepository.findOne({ vendorId: transaction.userVendorId });

    if (!user) {
      throw new Error('User not exists');
    }

    user.amount += transaction.amount;

    await getManager().transaction(async() => {
      this.usersRepository.save(user);
      this.transactionsRepository.save(transaction);
    });

    return transaction;
  }
}
