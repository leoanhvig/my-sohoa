# Google Drive folder sync

This app now syncs PDF/image metadata from a Google Drive folder into Firestore. It does not upload local files.

## 1. Google setup

1. Open Google Cloud Console.
2. Enable **Google Drive API**.
3. Create a **Service Account**.
4. Create a JSON key for that service account.
5. Open the target Drive folder and share it with the service account email as **Viewer**.

Example folder used by the UI:

```text
https://drive.google.com/drive/folders/1XIEoO8HJBbr1jzgHOlaxzC69Oq0Yrj_y?usp=sharing
```

Folder ID:

```text
1XIEoO8HJBbr1jzgHOlaxzC69Oq0Yrj_y
```

## 2. Firebase Admin setup

Create a Firebase Admin service account key from Firebase Console > Project Settings > Service accounts.

## 3. Backend env

Copy:

```bash
cp server/.env.example server/.env
```

Then fill:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_PROJECT_ID=so-hoa-afd05
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Do not put these credentials in frontend `VITE_*` env variables.

## 4. Run app

```bash
yarn dev:all
```

Frontend: http://localhost:5173
Backend: http://localhost:4000

## 5. Firestore data

The backend creates/reuses `File` by `drive_folder_id`, then creates missing `Documents` by `drive_file_id`.

Supported files:

- PDF
- images

Resume behavior:

- If a Drive folder was already synced, it reuses the existing `File` record.
- It skips existing `Documents` by `drive_file_id`.
- It only creates documents for newly discovered files.
