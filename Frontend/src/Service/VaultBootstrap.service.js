import { exportDEKToJwk, generateDEK } from "./VaultCrypto.service.js";

const VAULT_KEY_STORAGE = "keymate_vault_key_meta";

export const loadOrCreateLocalVaultKey = async () => {
  const saved = localStorage.getItem(VAULT_KEY_STORAGE);

  if (saved) {
    return JSON.parse(saved);
  }

  const dek = await generateDEK();
  const dekJwk = await exportDEKToJwk(dek);

  const vaultMeta = {
    version: 1,
    mode: "local-dev-dek",
    dekJwk,
  };

  localStorage.setItem(VAULT_KEY_STORAGE, JSON.stringify(vaultMeta));
  return vaultMeta;
};

export const replaceLocalVaultKey = async () => {
  const dek = await generateDEK();
  const dekJwk = await exportDEKToJwk(dek);

  const vaultMeta = {
    version: 1,
    mode: "local-dev-dek",
    dekJwk,
  };

  localStorage.setItem(VAULT_KEY_STORAGE, JSON.stringify(vaultMeta));
  return vaultMeta;
};

export const clearLocalVaultKey = () => {
  localStorage.removeItem(VAULT_KEY_STORAGE);
};
