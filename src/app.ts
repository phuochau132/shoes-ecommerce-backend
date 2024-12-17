import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import config from '@/config';

const startServer = async () => {
  const app = express();

  app.use(express.json());
  app.use(helmet());
  app.use(cors());
  app.use(cookieParser());
  app.use('/static', express.static('uploads'));

  const apiRoutes = express.Router();

  app.use('/api', apiRoutes);

  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server started on port ${config.port} (${config.env})`);
  });
};

startServer();
