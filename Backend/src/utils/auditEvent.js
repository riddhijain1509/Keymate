export const AUDIT_STREAM_KEY = "audit:events";

const SECRET_KEY_PATTERNS = [
  /^password$/i,
  /^masterPassword$/i,
  /^recoveryKey$/i,
  /token/i,
  /^ciphertext$/i,
  /^iv$/i,
  /^encryptedDEK$/i,
  /^dek$/i,
];

const sanitizePrimitive = (value) => {
  if (value === undefined) return null;
  if (value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return String(value);
};

const sanitizeMetadata = (metadata = {}) => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return Object.entries(metadata).reduce((acc, [key, value]) => {
    if (SECRET_KEY_PATTERNS.some((pattern) => pattern.test(key))) {
      return acc;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      acc[key] = sanitizeMetadata(value);
      return acc;
    }

    acc[key] = sanitizePrimitive(value);
    return acc;
  }, {});
};

export const buildAuditEvent = ({
  userId = null,
  type,
  status = "success",
  severity = "info",
  ip = null,
  route = null,
  identifier = null,
  metadata = {},
  source = "app",
  occurredAt = new Date(),
}) => ({
  userId: userId ? String(userId) : null,
  type,
  status,
  severity,
  ip: ip ? String(ip) : null,
  route: route ? String(route) : null,
  identifier: identifier ? String(identifier).trim().toLowerCase() : null,
  metadata: sanitizeMetadata(metadata),
  source,
  occurredAt: occurredAt instanceof Date ? occurredAt.toISOString() : new Date(occurredAt).toISOString(),
});

export const parseAuditEvent = (payload) => {
  if (!payload) return null;

  if (typeof payload === "string") {
    return JSON.parse(payload);
  }

  return payload;
};
