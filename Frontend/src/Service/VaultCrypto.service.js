const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
};

const base64ToUint8Array = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
};

const hexToUint8Array = (hex) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

const uint8ArrayToHex = (bytes) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

export const generateDEK = async () => {
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
};

export const generateSalt = () => window.crypto.getRandomValues(new Uint8Array(16));

export const generateRecoveryKey = () => {
  const bytes = window.crypto.getRandomValues(new Uint8Array(32));
  return uint8ArrayToHex(bytes);
};

export const exportDEKToJwk = async (key) => {
  return window.crypto.subtle.exportKey("jwk", key);
};

export const importDEKFromJwk = async (jwk) => {
  return window.crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"]
  );
};

export const deriveWrappingKey = async (masterPassword, salt, iterations = 310000) => {
  const masterKey = await window.crypto.subtle.importKey(
    "raw",
    textEncoder.encode(masterPassword),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    masterKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
};

export const importRecoveryKey = async (recoveryKey) => {
  return window.crypto.subtle.importKey(
    "raw",
    hexToUint8Array(recoveryKey),
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"]
  );
};

export const wrapSecretWithKey = async (secret, wrappingKey) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const plaintext = textEncoder.encode(JSON.stringify(secret));

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    wrappingKey,
    plaintext
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv),
    version: 2,
  };
};

export const wrapDEK = async (dek, wrappingKey) => {
  const dekJwk = await exportDEKToJwk(dek);
  return wrapSecretWithKey(dekJwk, wrappingKey);
};

export const unwrapSecretWithKey = async (encryptedSecret, wrappingKey) => {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64ToUint8Array(encryptedSecret.iv),
    },
    wrappingKey,
    base64ToUint8Array(encryptedSecret.ciphertext)
  );

  return JSON.parse(textDecoder.decode(decrypted));
};

export const unwrapDEK = async (encryptedDEK, wrappingKey) => {
  return unwrapSecretWithKey(encryptedDEK, wrappingKey);
};

export const encryptVaultPayload = async (payload, dek) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const plaintext = textEncoder.encode(JSON.stringify(payload));

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    dek,
    plaintext
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv),
    version: 1,
  };
};

export const decryptVaultPayload = async ({ ciphertext, iv }, dek) => {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64ToUint8Array(iv),
    },
    dek,
    base64ToUint8Array(ciphertext)
  );

  return JSON.parse(textDecoder.decode(decrypted));
};
