# PDF Upload Server

Production-ready Express + TypeScript backend for uploading public PDF files to Supabase Storage.

## Features

- Upload PDF files to a public Supabase Storage bucket
- List uploaded PDF files newest first
- Delete uploaded files
- PDF-only validation
- 1 GB upload limit
- Unique filenames with timestamp + UUID
- Global JSON error handling
- Request logging
- Strict TypeScript with ES Modules
- ESLint, Prettier, Docker, and Docker Compose

## Folder Structure

```text
pdf-server/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   └── supabase.ts
│   ├── routes/
│   │   ├── upload.route.ts
│   │   └── file.route.ts
│   ├── controllers/
│   │   ├── upload.controller.ts
│   │   └── file.controller.ts
│   ├── services/
│   │   └── storage.service.ts
│   ├── middlewares/
│   │   ├── upload.middleware.ts
│   │   └── error.middleware.ts
│   ├── utils/
│   │   └── file.util.ts
│   ├── types/
│   │   ├── express.d.ts
│   │   └── http-error.ts
│   └── constants/
│       └── storage.constants.ts
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── eslint.config.js
├── package.json
└── tsconfig.json
```

## Requirements

- Node.js 20+
- npm
- Supabase project
- Public Supabase Storage bucket named `pdfs`

## Supabase Setup

1. Open your Supabase project.
2. Go to **Storage**.
3. Create a bucket named `pdfs`.
4. Set the bucket visibility to **Public**.
5. Go to **Project Settings > API**.
6. Copy:
   - Project URL
   - Service Role key

> Never expose `SUPABASE_SERVICE_ROLE` in the frontend.

## Installation

```bash
cd pdf-server
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE=your-service-role-key
```

## Run Locally

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Production:

```bash
npm start
```

## Docker

```bash
docker compose up --build
```

The API will be available at `http://localhost:3000`.

## Deploy

### Railway / Render

Use these settings:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Node version: `20+`
- Environment variables:
  - `PORT`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE`

### VPS

```bash
npm install
npm run build
PORT=3000 npm start
```

For production, run the process with a process manager such as PM2 or Docker Compose.

## API Documentation

Base URL for local development:

```text
http://localhost:3000
```

### Health Check

```http
GET /
```

Response:

```json
{
  "status": "ok"
}
```

### Upload PDF

```http
POST /api/upload
Content-Type: multipart/form-data
```

Form field:

| Field  | Type | Required | Description       |
| ------ | ---- | -------- | ----------------- |
| `file` | File | Yes      | PDF file, max 1GB |

Successful response:

```json
{
  "success": true,
  "url": "https://your-project.supabase.co/storage/v1/object/public/pdfs/1720000000000-uuid.pdf",
  "filename": "1720000000000-uuid.pdf",
  "size": 12345
}
```

Error response:

```json
{
  "success": false,
  "message": "Only PDF files are allowed."
}
```

cURL:

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/absolute/path/to/file.pdf"
```

### List Files

```http
GET /api/files
```

Response:

```json
[
  {
    "name": "1720000000000-uuid.pdf",
    "url": "https://your-project.supabase.co/storage/v1/object/public/pdfs/1720000000000-uuid.pdf",
    "size": 12345,
    "createdAt": "2026-07-08T10:00:00.000Z"
  }
]
```

cURL:

```bash
curl http://localhost:3000/api/files
```

### Delete File

```http
DELETE /api/files/:filename
```

Response:

```json
{
  "success": true
}
```

cURL:

```bash
curl -X DELETE http://localhost:3000/api/files/1720000000000-uuid.pdf
```

## Postman Examples

### Upload PDF

- Method: `POST`
- URL: `http://localhost:3000/api/upload`
- Body: `form-data`
- Key: `file`
- Type: `File`
- Value: select a `.pdf` file

### List Files

- Method: `GET`
- URL: `http://localhost:3000/api/files`

### Delete File

- Method: `DELETE`
- URL: `http://localhost:3000/api/files/{{filename}}`

## React + Axios Example

Install Axios in the frontend if needed:

```bash
npm install axios
```

```tsx
import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_PDF_SERVER_URL ?? 'http://localhost:3000';

type UploadResponse = {
  success: boolean;
  url: string;
  filename: string;
  size: number;
};

export async function uploadPdf(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await axios.post<UploadResponse>(`${API_BASE_URL}/api/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
}

export function PdfUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadPdf(file);
      setUrl(result.url);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="application/pdf"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />

      <button type="button" onClick={handleUpload} disabled={!file || isUploading}>
        {isUploading ? 'Uploading...' : 'Upload PDF'}
      </button>

      {url && (
        <p>
          Uploaded PDF:{' '}
          <a href={url} target="_blank" rel="noreferrer">
            {url}
          </a>
        </p>
      )}
    </div>
  );
}
```

Frontend `.env` example:

```env
VITE_PDF_SERVER_URL=http://localhost:3000
```

## Notes

- This server intentionally has no authentication because it is for private use.
- Add authentication before exposing it to untrusted users.
- The Service Role key must only live on the backend.
