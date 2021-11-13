declare namespace NodeJS {
  export interface ProcessEnv {
    DB_FORWARD_PORT?: number;
    DB_HOST?: string;
    DB_DATABASE?: string;
    DB_PORT?: number;
    DB_USERNAME?: string;
    DB_PASSWORD?: string;
    SERVICE_FORWARD_PORT?: number;

    JWT_SECRET?: string;

    ENVIRONMENT: Environment;
  }
  export type Environment = 'dev' | 'local' | 'prod' | 'test';
}