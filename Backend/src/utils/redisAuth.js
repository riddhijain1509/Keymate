import crypto from "crypto";
import { initRedis } from "../config/redis.js";

const LOGIN_FAILURE_WINDOW_SECONDS = 15 * 60;
const LOGIN_FAILURE_MAX_ATTEMPTS = 5;
const RESET_TOKEN_TTL_SECONDS = 60 * 60;

const normalizeValue = (value = "") => String(value).trim().toLowerCase();

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

const getIpAddress = (req) => {
  const forwardedFor = req?.headers?.["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "unknown";
};

const loginFailureKey = (kind, value) => `auth:login-failure:${kind}:${normalizeValue(value)}`;
const resetTokenKey = (tokenHash) => `auth:reset-token:${tokenHash}`;
const resetEmailKey = (email) => `auth:reset-email:${normalizeValue(email)}`;

export const getClientIp = getIpAddress;

export const recordFailedLoginAttempt = async ({ identifier, ip }) => {
  try {
    const client = await initRedis();
    if (!client) return null;

    const normalizedIdentifier = normalizeValue(identifier);
    const normalizedIp = normalizeValue(ip || "unknown");
    const userKey = loginFailureKey("user", normalizedIdentifier);
    const ipKey = loginFailureKey("ip", normalizedIp);

    const [userCount, ipCount] = await Promise.all([client.incr(userKey), client.incr(ipKey)]);

    if (userCount === 1) {
      await client.expire(userKey, LOGIN_FAILURE_WINDOW_SECONDS);
    }

    if (ipCount === 1) {
      await client.expire(ipKey, LOGIN_FAILURE_WINDOW_SECONDS);
    }

    const blocked = userCount > LOGIN_FAILURE_MAX_ATTEMPTS || ipCount > LOGIN_FAILURE_MAX_ATTEMPTS;

    return {
      blocked,
      userCount,
      ipCount,
    };
  } catch (error) {
    return null;
  }
};

export const clearFailedLoginAttempts = async ({ identifier, ip }) => {
  try {
    const client = await initRedis();
    if (!client) return false;

    const normalizedIdentifier = normalizeValue(identifier);
    const normalizedIp = normalizeValue(ip || "unknown");
    const userKey = loginFailureKey("user", normalizedIdentifier);
    const ipKey = loginFailureKey("ip", normalizedIp);

    await client.del(userKey, ipKey);
    return true;
  } catch (error) {
    return false;
  }
};

export const storeResetToken = async ({ email, userId, token }) => {
  try {
    const client = await initRedis();
    if (!client) return false;

    const normalizedEmail = normalizeValue(email);
    const tokenHash = sha256(token);
    const emailKey = resetEmailKey(normalizedEmail);
    const tokenKey = resetTokenKey(tokenHash);

    const previousHash = await client.get(emailKey);
    if (previousHash) {
      await client.del(resetTokenKey(previousHash));
    }

    await client.set(emailKey, tokenHash, { EX: RESET_TOKEN_TTL_SECONDS });
    await client.set(
      tokenKey,
      JSON.stringify({
        userId,
        email: normalizedEmail,
      }),
      { EX: RESET_TOKEN_TTL_SECONDS }
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const consumeResetToken = async (token) => {
  try {
    const client = await initRedis();
    if (!client) return null;

    const tokenHash = sha256(token);
    const tokenKey = resetTokenKey(tokenHash);
    const storedValue = await client.get(tokenKey);
    if (!storedValue) return null;

    const payload = JSON.parse(storedValue);
    const emailKey = resetEmailKey(payload.email);
    const currentHash = await client.get(emailKey);
    if (currentHash !== tokenHash) return null;

    await client.del(tokenKey, emailKey);
    return payload;
  } catch (error) {
    return null;
  }
};
