import type { Request, Response } from 'express';
import { deletePdfFile, listPdfFiles } from '../services/storage.service.js';
import { HttpError } from '../types/http-error.js';

export const getFiles = async (_request: Request, response: Response): Promise<void> => {
  const files = await listPdfFiles();
  response.json(files);
};

export const removeFile = async (request: Request, response: Response): Promise<void> => {
  const { filename } = request.params;

  if (!filename || Array.isArray(filename)) {
    throw new HttpError(400, 'PDF filename is required.');
  }

  await deletePdfFile(filename);
  response.json({ success: true });
};
