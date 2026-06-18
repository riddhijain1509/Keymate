const SIGNAL_TYPES = new Set([
  "login_success",
  "login_failed",
  "login_rate_limited",
  "login_from_new_device",
  "forgot_password_requested",
  "password_reset_success",
  "password_reset_failed",
  "vault_created",
  "vault_rotated",
  "vault_unlock_failed_multiple",
  "recovery_key_regenerated",
  "password_created",
  "password_updated",
  "password_deleted",
]);

const sanitizeSignalMetadata = (metadata = {}) => {
  if (!metadata || typeof metadata !== "object") return {};

  const allowedKeys = [
    "reason",
    "websiteName",
    "username",
    "userCount",
    "ipCount",
    "limit",
    "windowSeconds",
    "retryAfterSeconds",
    "storage",
    "deviceLabel",
    "unlockMethod",
    "failedCount",
  ];
  return Object.entries(metadata).reduce((acc, [key, value]) => {
    if (!allowedKeys.includes(key)) return acc;
    acc[key] = value;
    return acc;
  }, {});
};

export const buildSecuritySignal = (event) => {
  if (!event?.type || !SIGNAL_TYPES.has(event.type)) return null;

  return {
    type: event.type,
    status: event.status,
    severity: event.severity,
    route: event.route,
    occurredAt: event.occurredAt,
    metadata: sanitizeSignalMetadata(event.metadata),
  };
};
