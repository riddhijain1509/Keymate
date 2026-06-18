import { initRedis } from "../config/redis.js";
import { AuditLog } from "../models/auditLog.model.js";
import { AUDIT_STREAM_KEY, buildAuditEvent, parseAuditEvent } from "./auditEvent.js";

const toAuditDocument = (event) => ({
  user: event.userId || null,
  type: event.type,
  status: event.status,
  severity: event.severity,
  ip: event.ip,
  route: event.route,
  identifier: event.identifier,
  metadata: event.metadata || {},
  source: event.source || "app",
  occurredAt: event.occurredAt ? new Date(event.occurredAt) : new Date(),
});

export const persistAuditEvent = async (event) => {
  const parsed = parseAuditEvent(event);
  if (!parsed?.type) return null;
  return AuditLog.create(toAuditDocument(parsed));
};

export const queueAuditEvent = async (payload) => {
  const event = buildAuditEvent(payload);

  try {
    const client = await initRedis();
    if (!client) {
      await persistAuditEvent(event);
      return { queued: false, persistedDirectly: true };
    }

    await client.xAdd(AUDIT_STREAM_KEY, "*", {
      event: JSON.stringify(event),
    });

    return { queued: true, persistedDirectly: false };
  } catch (error) {
    try {
      await persistAuditEvent(event);
      return { queued: false, persistedDirectly: true };
    } catch {
      return { queued: false, persistedDirectly: false };
    }
  }
};
