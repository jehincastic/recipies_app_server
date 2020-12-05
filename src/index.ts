/* eslint-disable import/first */
import 'reflect-metadata';
import dotEnv from 'dotenv';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import Redis from 'ioredis';
import session from 'express-session';
import redisStore from 'connect-redis';
import cors from 'cors';
import { createConnection } from 'typeorm';

dotEnv.config();

import {
  COOKIE_NAME,
  __prod__,
  COOKIE_SECRET,
  COOKIE_AGE,
} from './constants';
import { UserResolver } from './resolvers/user';
import { CircleResolver } from './resolvers/circle';
import { UserToCircleResolver } from './resolvers/userToCircle';
import { RecipyResolver } from './resolvers/recipy';
import { RecipyToCircleResolver } from './resolvers/recipyToCircle';

const main = async () => {
  const conn = await createConnection();
  conn.runMigrations();
  const app = express();
  const RedisStore = redisStore(session);
  const redis = new Redis();
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));
  app.use(session({
    name: COOKIE_NAME,
    store: new RedisStore({
      client: redis,
      disableTouch: true,
    }),
    secret: COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: COOKIE_AGE,
      httpOnly: true,
      sameSite: 'lax',
      secure: __prod__,
    },
  }));

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        UserResolver,
        CircleResolver,
        UserToCircleResolver,
        RecipyResolver,
        RecipyToCircleResolver,
      ],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    // eslint-disable-next-line no-console
    console.log('Server Started on Port 4000 🚀');
  });
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});
