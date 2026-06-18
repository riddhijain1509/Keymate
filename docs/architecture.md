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
graph LR
  U[User] --> F[Frontend]
  F --> A[Auth API]
  F --> P[Password API]
  A --> R[Redis]
  P --> R
  A --> DB[MongoDB]
  P --> DB

  F --> K1[Master password key]
  F --> K2[Recovery key]
  K1 --> DEK[Vault DEK]
  K2 --> DEK
  DEK --> ENC[Encrypt entries]
  R --> RL[Rate limits]
  R --> RS[Reset TTL]
  R --> AS[Audit stream]
  AS --> AL[Audit logs]
  AS --> SG[Live signals]
  SG --> F
```

## Vault Setup

```mermaid
graph LR
  U[User] --> F[Frontend]
  F --> G[Generate DEK]
  F --> E[Encrypt entries]
  F --> M[Wrap DEK with master password]
  F --> R[Wrap DEK with recovery key]
  F --> B[Save vault metadata]
  B --> S[Stored in backend]
```

## Unlock Flow

```mermaid
graph LR
  U[User] --> F[Frontend]
  F --> B[Fetch vault metadata]
  B --> F
  F --> D[Derive or import unlocking key]
  F --> U2[Unwrap DEK in browser]
  U2 --> M[Keep DEK in memory]
```

## Rotation Flow

```mermaid
graph LR
  U[User] --> F[Frontend]
  F --> D[Use unlocked DEK]
  F --> N[Generate new salt and recovery key]
  F --> W[Re-wrap same DEK]
  F --> B[Patch vault metadata]
  B --> S[Rotation success]
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
