// require('dotenv').config();
// import path from "path";
import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { IS_PROD } from "./constants";
// // import session from "express-session";
// // import connectRedis from "connect-redis";
// // import Redis from "ioredis";
import cors from "cors";
// import { IS_PROD } from "./constants";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { User } from "./entities/User";
import { Todo } from "./entities/Todo";
import { UserResolver } from './resolvers/user';
// import { ANSI_ESCAPES } from "./types";
import { GraphQLSchema } from "graphql";
import { ANSI_ESCAPES } from "./types";
import { authMiddleware } from "./utils/authMiddleWare";

const {
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  CORS_ALLOWED
} = process.env;

(async function(): Promise<void>{
  console.log("hello world");
  //connect to db
  await createConnection({
    type: "postgres",
    url: undefined,
    database: !IS_PROD ? DB_NAME : undefined,
    password: !IS_PROD ? DB_PASSWORD : undefined,
    username: !IS_PROD ? DB_USER : undefined,
    logging: true,
    synchronize: true,
    ssl: IS_PROD,
    extra: IS_PROD && {
      ssl: {
        rejectUnauthorized: false,
      },
    },
    entities: [User, Todo]
  });

  console.log(`${ANSI_ESCAPES.yellow}`, `postgres connection success`, `${ANSI_ESCAPES.reset}`);

  //create express app
  const app = express();

  //create graphql server
  let MyGraphQLSchema: GraphQLSchema;

  //BUILD THE SCHEMA

  MyGraphQLSchema = await buildSchema({
    resolvers: [UserResolver],
    validate: false
  });
  console.log(`${ANSI_ESCAPES.yellow}`, `graphql schema build success`, `${ANSI_ESCAPES.reset}`);

  // express cors
  app.use(cors({
    origin: new RegExp(CORS_ALLOWED as string),
    credentials: true
  }))
  
  //create apollo server
  const apolloServer = new ApolloServer({
    schema: MyGraphQLSchema,
    context: authMiddleware
  });
  //apollo server middleware
  apolloServer.applyMiddleware({
    app,
    cors: {
      origin: new RegExp(CORS_ALLOWED as string),
      credentials: true
    }
  });
  
  //express middleware
  app.use(express.urlencoded({
    extended: false
  }));
  app.use(express.json());


  //other post deployment configs

  // //IF-ENV IN DEPLOYMENT
  // if (process.env.NODE_ENV === 'production') {
  //   //STATIC ASSETS FROM VUE BUILD FOLDER
  //   app.use(express.static(
  //     path.join(__dirname, '../../client/dist')
  //   ));
  //   // IF TRAVELS ANY ROUTE OUTSIDE VUE'S CURRENT PAGE REDIRECT TO ROOT
  //   app.get('*', (_req, res, next) => {
  //     res.sendFile(path.join(
  //       __dirname, '../client/dist/index.html'
  //     ));
  //     next();
  //   });
  //   //REDIRECT HTTP TRAFFIC TO HTTPS
  //   app.use((req, res, next) => {
  //     if (req.header('x-forwarded-proto') !== 'https') res.redirect(`https://${req.header('host')}${req.url}`);
  //     next();
  //   });
  // }

  // app.use('/', async (_, res) => {
  //   res.status(404).send("client path eventually")
  // });

  //CREATE PORT
  const PORT = process.env.PORT || 4000;
  //SERVER LISTEN
  app.listen(PORT, () => {
    console.log(
      ANSI_ESCAPES.yellow,
      `server started on ${PORT}`,
      ANSI_ESCAPES.reset
    );
    console.log(
      ANSI_ESCAPES.purple,
      `graphql started? ${apolloServer.graphqlPath}`,
      ANSI_ESCAPES.reset
    );
  });



})().catch((e: Error) => {
  return console.error(e);
});