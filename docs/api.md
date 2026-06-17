# API Reference

## User Routes

- `POST /users/register`
- `POST /users/login`
- `POST /users/forgotpassword`
- `POST /users/resetpassword/:token`
- `POST /users/logout`
- `POST /users/refresh-token`
- `GET /users/getcurrentuser`

## Vault Routes

- `POST /users/vault/setup`
- `GET /users/vault/meta`
- `PATCH /users/vault/rotate`

## Password Routes

- `POST /password/addpassword`
- `GET /password/allpasswords`
- `GET /password/getpassword/:passwordID`
- `PATCH /password/updatePassword/:passwordID`
- `DELETE /password/deletePassword/:passwordID`

## Typical Payload Shape

Vault metadata stores wrapped key material and KDF details, while password records store ciphertext and IV.

## Behavior Notes

- Authentication routes use JWT.
- Vault routes require a verified session.
- Password routes operate on user-owned records only.

