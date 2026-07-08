import multer from 'multer';
import { MAX_FILE_SIZE_BYTES, PDF_MIME_TYPE } from '../constants/storage.constants.js';
import { HttpError } from '../types/http-error.js';

export const uploadPdfMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (_request, file, callback) => {
    if (file.mimetype !== PDF_MIME_TYPE) {
      callback(new HttpError(400, 'Only PDF files are allowed.'));
      return;
    }

    callback(null, true);
  },
}).single('file');
