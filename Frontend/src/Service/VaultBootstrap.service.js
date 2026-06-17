import {
  deriveWrappingKey,
  generateDEK,
  generateSalt,
  exportDEKToJwk,
  unwrapDEK,
  wrapDEK,
} from "./VaultCrypto.service.js";
const backendURL = import.meta.env?.VITE_BACKEND_URL;

export const fetchVaultMetaService = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return { hasVault: false, vaultKeyMeta: null };

  const response = await fetch(`${backendURL}/users/vault/meta`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return data?.data ?? { hasVault: false, vaultKeyMeta: null };
};

export const setupVaultService = async (masterPassword) => {
  const token = localStorage.getItem("accessToken");
  const dek = await generateDEK();
  const salt = generateSalt();
  const iterations = 310000;
  const wrappingKey = await deriveWrappingKey(masterPassword, salt, iterations);
  const encryptedDEK = await wrapDEK(dek, wrappingKey);

  const response = await fetch(`${backendURL}/users/vault/setup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vaultKeyMeta: {
        version: 2,
        mode: "master-password",
        encryptedDEK,
        salt: btoa(String.fromCharCode(...salt)),
        kdf: {
          name: "PBKDF2",
          hash: "SHA-256",
          iterations,
          keyLength: 256,
        },
      },
    }),
  });

  const data = await response.json();
  if (response.status !== 200) {
    throw new Error(data?.message || "Failed to save vault setup");
  }

  return {
    vaultMeta: data.data,
    vaultKeyJwk: await exportDEKToJwk(dek),
  };
};

export const unlockVaultService = async (masterPassword, vaultMeta) => {
  if (!vaultMeta?.encryptedDEK || !vaultMeta?.salt || !vaultMeta?.kdf) {
    throw new Error("Vault metadata is missing");
  }

  const saltBytes = Uint8Array.from(atob(vaultMeta.salt), (c) => c.charCodeAt(0));
  const wrappingKey = await deriveWrappingKey(
    masterPassword,
    saltBytes,
    vaultMeta.kdf.iterations
  );
  const dekJwk = await unwrapDEK(vaultMeta.encryptedDEK, wrappingKey);
  return dekJwk;
};
