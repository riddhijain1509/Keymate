import { initRedis } from "../config/redis.js";
import { AUDIT_STREAM_KEY, parseAuditEvent } from "../utils/auditEvent.js";
import { persistAuditEvent } from "../utils/auditStream.js";

let auditWorkerStarted = false;

export const startAuditWorker = async () => {
  if (auditWorkerStarted) return false;

  const client = await initRedis();
  if (!client) {
    console.warn("Audit worker not started because Redis is unavailable.");
    return false;
  }

  const workerClient = client.duplicate();
  await workerClient.connect();
  auditWorkerStarted = true;

  let lastId = "$";

  const loop = async () => {
    while (auditWorkerStarted) {
      try {
        const streams = await workerClient.xRead(
          [{ key: AUDIT_STREAM_KEY, id: lastId }],
          { BLOCK: 5000, COUNT: 25 }
        );

        if (!streams?.length) {
          continue;
        }

        for (const stream of streams) {
          for (const message of stream.messages) {
            const rawEvent = message.message?.event;
            const parsedEvent = parseAuditEvent(rawEvent);

            if (parsedEvent?.type) {
              await persistAuditEvent(parsedEvent);
            }

            lastId = message.id;
          }
        }
      } catch (error) {
        console.error("Audit worker error:", error.message);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  };

  loop().catch((error) => {
    console.error("Audit worker stopped unexpectedly:", error.message);
    auditWorkerStarted = false;
  });

  return true;
};
