import type { Request, Response } from 'express';
import { uploadPdfToStorage } from '../services/storage.service.js';
import { HttpError } from '../types/http-error.js';

export const uploadPdf = async (request: Request, response: Response): Promise<void> => {
  if (!request.file) {
    throw new HttpError(400, 'PDF file is required in the "file" field.');
  }

  const uploadedPdf = await uploadPdfToStorage(request.file);

  response.status(201).json({
    success: true,
    url: uploadedPdf.url,
    filename: uploadedPdf.filename,
    size: uploadedPdf.size,
  });
};
