import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { MAX_FILE_SIZE_MB } from '../constants/storage.constants.js';
import { HttpError } from '../types/http-error.js';

export const notFoundMiddleware = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  next(new HttpError(404, `Route not found: ${request.method} ${request.originalUrl}`));
};

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  let statusCode = 500;
  let message = 'Internal server error.';

  if (error instanceof HttpError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof multer.MulterError) {
    statusCode = 400;
    message =
      error.code === 'LIMIT_FILE_SIZE'
        ? `PDF file must be ${MAX_FILE_SIZE_MB}MB or smaller.`
        : error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  response.status(statusCode).json({
    success: false,
    message,
  });
};
