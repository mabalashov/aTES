import {FailedMessage} from "../failed-messages/entities/failed-message.entity";
import {User} from "../users/entities/user";
import {Task} from "../tasks/entities/task";
import {Transaction} from "../transactions/entities/transaction";
import {UserDaily} from "../transactions/entities/user-daily";

export default () => ({
  database: {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'ates-accounting_database',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'username',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'default',
    entities: [FailedMessage, User, Task, Transaction, UserDaily],
    synchronize: true,
  },
});
