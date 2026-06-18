const normalizeHeaderValue = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 160) : null;
};

export const getDeviceContext = (req) => {
  const deviceId = normalizeHeaderValue(req.header("x-device-id"));
  const deviceLabel = normalizeHeaderValue(req.header("x-device-label"));

  return {
    deviceId,
    deviceLabel: deviceLabel || "Unknown device",
  };
};

export const upsertKnownDevice = (user, deviceContext) => {
  if (!user || !deviceContext?.deviceId) {
    return { isNewDevice: false, deviceLabel: deviceContext?.deviceLabel || "Unknown device" };
  }

  const knownDevices = Array.isArray(user.knownDevices) ? user.knownDevices : [];
  const existingDevice = knownDevices.find((device) => device.deviceId === deviceContext.deviceId);

  if (existingDevice) {
    existingDevice.label = deviceContext.deviceLabel || existingDevice.label || "Unknown device";
    existingDevice.lastSeenAt = new Date();
    return {
      isNewDevice: false,
      deviceLabel: existingDevice.label,
    };
  }

  knownDevices.push({
    deviceId: deviceContext.deviceId,
    label: deviceContext.deviceLabel || "Unknown device",
    firstSeenAt: new Date(),
    lastSeenAt: new Date(),
  });
  user.knownDevices = knownDevices;

  return {
    isNewDevice: true,
    deviceLabel: deviceContext.deviceLabel || "Unknown device",
  };
};
