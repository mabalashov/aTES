import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {MicroserviceOptions, Transport} from "@nestjs/microservices";
import { join } from 'path';
import {NestExpressApplication} from "@nestjs/platform-express";
import * as session from "express-session";
import flash = require("connect-flash");
import * as exphbs from 'express-handlebars';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['ates_broker:29092'],
      },
      consumer: {
        groupId: 'auth-consumer',
        allowAutoTopicCreation: true,
      },
    }
  });

  app.use(
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
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
