const DEVICE_STORAGE_KEY = "keymate_device_id";

const generateDeviceId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const getOrCreateDeviceId = () => {
  const existingDeviceId = localStorage.getItem(DEVICE_STORAGE_KEY);
  if (existingDeviceId) {
    return existingDeviceId;
  }

  const deviceId = generateDeviceId();
  localStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
  return deviceId;
};

export const getDeviceLabel = () => {
  const platform = navigator.userAgentData?.platform || navigator.platform || "Unknown platform";
  const browser = navigator.userAgentData?.brands?.[0]?.brand || "Browser";

  return `${browser} on ${platform}`;
};

export const getDeviceHeaders = () => ({
  "x-device-id": getOrCreateDeviceId(),
  "x-device-label": getDeviceLabel(),
});
