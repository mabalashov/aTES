import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {NestExpressApplication} from "@nestjs/platform-express";
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import * as session from "express-session";
import flash = require("connect-flash");
import * as exphbs from 'express-handlebars';
// import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import {join} from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['ates_broker:29092'],
      },
      consumer: {
        groupId: 'analytics-consumer',
        allowAutoTopicCreation: true,
      },
    },
  });

  app.use(
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(flash());
  app.use(cookieParser());

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'main' }));
  app.setViewEngine('hbs');

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
