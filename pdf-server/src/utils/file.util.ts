import { randomUUID } from 'node:crypto';
import path from 'node:path';

export const createUniquePdfFilename = (): string => {
  return `${Date.now()}-${randomUUID()}.pdf`;
};

export const sanitizeStorageFilename = (filename: string): string => {
  const basename = path.basename(filename);

  if (!basename || basename !== filename || !basename.toLowerCase().endsWith('.pdf')) {
    throw new Error('Invalid PDF filename.');
  }

  return basename;
};
