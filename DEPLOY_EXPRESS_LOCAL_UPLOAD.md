# Deploy Express + local upload

Project này deploy theo mô hình:

- **Frontend**: Vercel
- **API Express + local upload**: Render/Railway/Fly/VPS

Không deploy API Express local-upload trực tiếp vào Vercel vì Vercel không chạy long-running Express server trên port `4000`, và filesystem không persist ổn định cho upload local.

## 1. Local development

Chạy frontend + API cùng lúc:

```bash
yarn dev
```

Lệnh này chạy:

- Frontend Vite: `http://localhost:5173`
- API Express: `http://localhost:4000`

## 2. Deploy frontend lên Vercel

Build/deploy frontend như hiện tại:

```bash
vercel build --prod && vercel deploy --prebuilt --prod
```

Trên Vercel cần set environment variable:

```env
VITE_API_BASE_URL=https://your-api-domain.onrender.com
```

Ví dụ:

```env
VITE_API_BASE_URL=https://so-hoa-api.onrender.com
```

Sau khi đổi env trên Vercel, cần build/deploy lại frontend.

## 3. Deploy API Express lên Render Free

### 3.1 Tạo Web Service

1. Vào Render: https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Chọn repo `so-hoa`
5. Runtime: Node

### 3.2 Render settings

Nếu deploy từ root repo, dùng các command sau:

```bash
Build Command: yarn install --frozen-lockfile && yarn build:api
Start Command: yarn start:api
```

Nếu Render dùng npm thay vì yarn:

```bash
Build Command: npm install && npm run build:api
Start Command: npm run start:api
```

### 3.3 Render environment variables

Set các biến sau trên Render:

```env
NODE_ENV=production
PORT=4000
CLIENT_ORIGIN=https://your-frontend-domain.vercel.app
UPLOADS_DIR=server/uploads
MAX_UPLOAD_FILE_SIZE_MB=1024
```

Ví dụ:

```env
CLIENT_ORIGIN=https://so-hoa.vercel.app
```

Nếu API dùng Firebase Admin service account, set thêm các env mà `server/src/firebaseAdmin.ts` đang yêu cầu.

## 4. Kiểm tra API sau deploy

Mở URL:

```text
https://your-api-domain.onrender.com/api/health
```

Nếu trả về:

```json
{ "status": "ok" }
```

là API chạy đúng.

## 5. Flow deploy chuẩn

### Khi chỉ đổi frontend

```bash
vercel build --prod && vercel deploy --prebuilt --prod
```

### Khi đổi API server

Push code lên GitHub, Render sẽ auto deploy nếu bật auto deploy.

Hoặc vào Render dashboard → Manual Deploy.

### Khi đổi cả frontend và API

1. Push code để Render deploy API.
2. Đợi API deploy xong.
3. Chạy:

```bash
vercel build --prod && vercel deploy --prebuilt --prod
```

## 6. Lưu ý quan trọng về local upload trên free hosting

Render Free có thể sleep/restart. File upload local trong `server/uploads` có thể không bền vững lâu dài nếu service restart/deploy.

Nếu cần production ổn định, nên chuyển file PDF sang storage thật như:

- Firebase Storage
- Google Cloud Storage
- S3
- Cloudflare R2

Hiện tại Express + local upload phù hợp cho demo/nội bộ nhỏ.
