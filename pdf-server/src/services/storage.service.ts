import { supabase } from '../config/supabase.js';
import { PDF_BUCKET_NAME, PDF_MIME_TYPE } from '../constants/storage.constants.js';
import { HttpError } from '../types/http-error.js';
import { createUniquePdfFilename, sanitizeStorageFilename } from '../utils/file.util.js';

export interface UploadedPdfResult {
  url: string;
  filename: string;
  size: number;
}

export interface PublicPdfFile {
  name: string;
  url: string;
  size: number;
  createdAt: string;
}

const getPublicUrl = (filename: string): string => {
  const { data } = supabase.storage.from(PDF_BUCKET_NAME).getPublicUrl(filename);
  return data.publicUrl;
};

export const uploadPdfToStorage = async (file: Express.Multer.File): Promise<UploadedPdfResult> => {
  const filename = createUniquePdfFilename();

  const { error } = await supabase.storage.from(PDF_BUCKET_NAME).upload(filename, file.buffer, {
    contentType: PDF_MIME_TYPE,
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw new HttpError(502, `Failed to upload PDF: ${error.message}`);
  }

  return {
    url: getPublicUrl(filename),
    filename,
    size: file.size,
  };
};

export const listPdfFiles = async (): Promise<PublicPdfFile[]> => {
  const { data, error } = await supabase.storage.from(PDF_BUCKET_NAME).list('', {
    limit: 1000,
    offset: 0,
    sortBy: {
      column: 'created_at',
      order: 'desc',
    },
  });

  if (error) {
    throw new HttpError(502, `Failed to list PDFs: ${error.message}`);
  }

  return (data ?? [])
    .filter((file) => file.name.toLowerCase().endsWith('.pdf'))
    .map((file) => ({
      name: file.name,
      url: getPublicUrl(file.name),
      size: file.metadata?.size ? Number(file.metadata.size) : 0,
      createdAt: file.created_at ?? file.updated_at ?? '',
    }))
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
};

export const deletePdfFile = async (filename: string): Promise<void> => {
  let safeFilename: string;

  try {
    safeFilename = sanitizeStorageFilename(filename);
  } catch {
    throw new HttpError(400, 'Invalid PDF filename.');
  }

  const { error } = await supabase.storage.from(PDF_BUCKET_NAME).remove([safeFilename]);

  if (error) {
    throw new HttpError(502, `Failed to delete PDF: ${error.message}`);
  }
};
