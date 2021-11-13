import {User} from "../users/entities/user";
import {Task} from "../tasks/entities/task";
import {FailedMessage} from "../failed-messages/entities/failed-message.entity";

export default () => ({
  database: {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'ates-task_database',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'username',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'default',
    entities: [User, Task, FailedMessage],
    synchronize: true,
  },
});
