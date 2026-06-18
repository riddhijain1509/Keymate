import { ApiResponse } from "../utils/ApiResponse.js";
import { initRedis } from "../config/redis.js";
import { getClientIp } from "../utils/redisAuth.js";
import { queueAuditEvent } from "../utils/auditStream.js";

export const createRedisRateLimiter = ({
  prefix,
  limit,
  windowSeconds,
  keyFn,
}) => async (req, res, next) => {
  try {
    const client = await initRedis();
    if (!client) return next();

    const scope = keyFn ? keyFn(req) : getClientIp(req);
    const key = `rate-limit:${prefix}:${String(scope).trim().toLowerCase()}`;
    const count = await client.incr(key);

    if (count === 1) {
      await client.expire(key, windowSeconds);
    }

    if (count > limit) {
      const ttl = await client.ttl(key);
      await queueAuditEvent({
        userId: req.user?._id || null,
        type: `${prefix}_rate_limited`,
        status: "blocked",
        severity: "warning",
        ip: getClientIp(req),
        route: req.originalUrl,
        identifier: req.body?.email || req.body?.text || null,
        metadata: {
          limit,
          windowSeconds,
          retryAfterSeconds: ttl > 0 ? ttl : windowSeconds,
        },
      });
      return res
        .status(429)
        .json(
          new ApiResponse(
            429,
            {
              retryAfterSeconds: ttl > 0 ? ttl : windowSeconds,
            },
            "Too many requests. Please try again later."
          )
        );
    }

    return next();
  } catch (error) {
    return next();
  }
};
