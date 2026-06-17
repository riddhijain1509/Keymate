import { ApiResponse } from "../utils/ApiResponse.js";
import { initRedis } from "../config/redis.js";
import { getClientIp } from "../utils/redisAuth.js";

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

