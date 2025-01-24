import 'reflect-metadata';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createConnection, useContainer } from 'typeorm';
import { Container } from 'typeorm-typedi-extensions';
import config from '@/config';
import errorMiddleware from '@/middlewares/error';
import routes from '@/routes';
import path from 'path';
import { helmetConfig } from './config/helmet';

const startServer = async () => {
  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'templates/ejs'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  useContainer(Container);
  app.use((req, res, next) => {
    app.use(helmetConfig());
    next();
  });
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    }),
  );

  await createConnection();
  app.use('/static', express.static('uploads'));
  const apiRoutes = express.Router();
  app.use('/api', apiRoutes);
  apiRoutes.use('/v1', routes);

  // if error is not an instanceOf ApiError, convert it.
  app.use(errorMiddleware.converter);

  // catch 404 and forward to error handler
  app.use(errorMiddleware.notFound);

  // error handler, send stacktrace only during development
  app.use(errorMiddleware.handler);

  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server started on port ${config.port} (${config.env})`);
  });
};

startServer();
