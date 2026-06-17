# Backend Guide

## Entry Points

- `src/server.js` starts the server.
- `src/app.js` configures middleware and routes.
- `src/db/index.js` connects to MongoDB.

## Route Modules

- `src/routes/user.routes.js`
- `src/routes/password.routes.js`

## Controllers

- `src/controllers/user.controller.js`
- `src/controllers/password.controller.js`

## Data Models

- `src/models/user.model.js`
- `src/models/password.model.js`

## Backend Responsibilities

- Validate authenticated requests.
- Store user records and vault metadata.
- Store password records for authenticated users.
- Support forgot-password and reset-password email flow.

## Important Note

The backend currently still participates in password payload handling. The architecture documentation explains the intended zero-knowledge direction and how the vault flow is being evolved toward client-side encryption.

