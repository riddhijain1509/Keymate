import { createClient } from "redis";

let redisClient = null;
let redisInitPromise = null;
let redisStatus = "unknown";

const buildClient = () => {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  const client = createClient({ url });
  client.on("error", (error) => {
    console.error("Redis client error:", error);
  });

  return client;
};

export const getRedisStatus = () => redisStatus;

export const getRedisClient = () => {
  if (redisClient?.isOpen) return redisClient;
  return null;
};

export const initRedis = async () => {
  if (redisStatus === "unavailable") return null;
  if (redisClient?.isOpen) {
    redisStatus = "available";
    return redisClient;
  }

  if (redisInitPromise) return redisInitPromise;

  redisInitPromise = (async () => {
    try {
      if (!redisClient) {
        redisClient = buildClient();
      }

      if (!redisClient) {
        redisStatus = "unavailable";
        return null;
      }

      if (!redisClient.isOpen) {
        await redisClient.connect();
      }

      redisStatus = "available";
      return redisClient;
    } catch (error) {
      redisStatus = "unavailable";
      console.warn("Redis unavailable, continuing without Redis-backed features:", error.message);
      return null;
    } finally {
      redisInitPromise = null;
    }
  })();

  return redisInitPromise;
};

export const closeRedis = async () => {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
  redisStatus = "unknown";
};
