import { Router } from 'express';
import { getFiles, removeFile } from '../controllers/file.controller.js';

export const fileRouter = Router();

fileRouter.get('/', getFiles);
fileRouter.delete('/:filename', removeFile);
