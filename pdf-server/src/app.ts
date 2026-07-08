import cors from 'cors';
import express from 'express';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware.js';
import { fileRouter } from './routes/file.route.js';
import { uploadRouter } from './routes/upload.route.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.use((request, _response, next) => {
  console.info(`${new Date().toISOString()} ${request.method} ${request.originalUrl}`);
  next();
});

app.get('/', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api/upload', uploadRouter);
app.use('/api/files', fileRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
