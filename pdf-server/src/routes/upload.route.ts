import { Router } from 'express';
import { uploadPdf } from '../controllers/upload.controller.js';
import { uploadPdfMiddleware } from '../middlewares/upload.middleware.js';

export const uploadRouter = Router();

uploadRouter.post('/', uploadPdfMiddleware, uploadPdf);
