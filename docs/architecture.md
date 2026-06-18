# Architecture

KeyMate's updated architecture separates authentication from vault encryption and adds Redis as a fast security and event-processing layer between the API and longer-lived storage.

## Core Concepts

- **DEK**: Data Encryption Key used to encrypt vault entries.
- **Master password**: Used to derive a wrapping key that protects the DEK.
- **Recovery key**: Alternate unlock path that wraps the same DEK.
- **Key rotation**: Re-wraps the same DEK with new key material without re-encrypting entries.
- **Redis security layer**: Handles short-lived counters, reset-token TTL, and the audit-event stream.
- **Live security signals**: Safe frontend notifications emitted from sanitized audit events over Socket.IO.

## High-Level Flow

```mermaid
flowchart LR
  U[User] --> F[React Frontend]
  F -->|JWT| A[Auth API]
  F -->|Encrypted vault ciphertext| P[Password API]
  A --> R[(Redis)]
  P --> R
  A --> DB[(MongoDB)]
  P --> DB

  F --> K1[Master password derived key]
  F --> K2[Recovery key derived key]
  K1 --> DEK[Vault DEK]
  K2 --> DEK
  DEK --> ENC[Encrypt password entries]
  R --> RL[Rate limits and failed-login counters]
  R --> RS[Reset-token TTL storage]
  R --> AS[Audit event stream]
  AS --> AL[Audit logs in MongoDB]
  AS --> SG[Socket.IO security signals]
  SG --> F
```

## Vault Setup

```mermaid
sequenceDiagram
  participant U as User
  participant F as Frontend
  participant B as Backend

  U->>F: Create vault
  F->>F: Generate random DEK
  F->>F: Encrypt entry data with AES-GCM
  F->>F: Wrap DEK with master password
  F->>F: Wrap same DEK with recovery key
  F->>B: Save vault metadata
  B-->>F: Vault metadata stored
```

## Unlock Flow

```mermaid
sequenceDiagram
  participant U as User
  participant F as Frontend
  participant B as Backend

  U->>F: Enter master password or recovery key
  F->>B: Fetch vault metadata
  B-->>F: encryptedDEK + wrap metadata
  F->>F: Derive or import unlocking key
  F->>F: Unwrap DEK in browser
  F->>F: Keep DEK in memory for session
```

## Rotation Flow

```mermaid
sequenceDiagram
  participant U as User
  participant F as Frontend
  participant B as Backend

  U->>F: Rotate vault keys
  F->>F: Use unlocked DEK
  F->>F: Generate new recovery key and new salt
  F->>F: Re-wrap the same DEK
  F->>B: PATCH updated vault metadata
  B-->>F: Rotation success
```

## Redis Responsibilities

- rate limits registration, login, and forgot-password requests
- tracks repeated failed logins by identifier and IP
- stores password reset tokens with TTL
- queues sanitized audit events for asynchronous processing
- feeds live safe security signals to the frontend through the audit worker

## Storage Boundaries

- **MongoDB stores**: users, vault metadata, ciphertext password entries, persisted audit logs
- **Redis stores**: counters, expiring reset-token data, audit stream events
- **Browser memory/session stores**: unwrapped DEK, active vault-unlock state, pending recovery-key reveal
