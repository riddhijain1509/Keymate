# Setup

## Backend

```bash
cd Backend
npm install
npm run dev
```

## Frontend

```bash
cd Frontend
npm install
npm run dev
```

## Backend Environment Variables

```env
PORT=8000
DB_NAME=Keymate
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
FRONT_END_URL=http://localhost:5173
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password_or_app_password
PRIVATE_KEY_BASE64=optional_base64_encoded_private_key
PRIVATE_KEY=optional_pem_private_key
PUBLIC_KEY=optional_pem_public_key
```

## Frontend Environment Variables

```env
VITE_BACKEND_URL=http://localhost:8000
```

## Notes

- The frontend reads the backend URL from `VITE_BACKEND_URL`.
- The backend requires MongoDB and JWT secrets to start.
- Vault unlock and password actions require a logged-in session.

