import {FailedMessage} from "../failed-messages/entities/failed-message.entity";
import {User} from "../users/entities/user";

export default () => ({
  database: {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'ates-analytics_database',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'username',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'default',
    entities: [FailedMessage, User],
    synchronize: true,
  },
});
