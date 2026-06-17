import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Dashboard from "../Dashboard.jsx";
import toast from "react-hot-toast";
import {
  clearVaultKey,
  setVaultKeyJwk,
  setVaultMeta,
} from "../../Features/todoslice.js";
import Footer from "../Footer.jsx";
import {
  fetchVaultMetaService,
  setupVaultService,
  rotateVaultKeysService,
  unlockVaultWithRecoveryService,
  unlockVaultService,
} from "../../Service/VaultBootstrap.service.js";
import { useNavigate } from "react-router-dom";
import { checkisloggedIn } from "../../Service/Auth.service.js";

const PrivateKey = () => {
  const pendingRecoveryStorageKey = "keymate_pending_recovery_key";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const vaultKeyJwk = useSelector((state) => state.vaultKeyJwk);
  const vaultMode = useSelector((state) => state.vaultMode);
  const vaultMeta = useSelector((state) => state.vaultMeta);
  const vaultMetaLoaded = useSelector((state) => state.vaultMetaLoaded);
  const vaultReady = useSelector((state) => state.vaultReady);
  const [masterPassword, setMasterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [unlockPassword, setUnlockPassword] = useState("");
  const [recoveryKeyInput, setRecoveryKeyInput] = useState("");
  const [unlockMethod, setUnlockMethod] = useState("master");
  const [recoveryKeyReveal, setRecoveryKeyReveal] = useState("");
  const [showRecoveryReveal, setShowRecoveryReveal] = useState(false);
  const [rotateMasterPassword, setRotateMasterPassword] = useState("");
  const [rotateConfirmPassword, setRotateConfirmPassword] = useState("");
  const [showRotateForm, setShowRotateForm] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!checkisloggedIn()) {
        navigate("/login");
        return;
      }

      if (!vaultMetaLoaded) {
        const metaResponse = await fetchVaultMetaService();
        dispatch(setVaultMeta(metaResponse?.vaultKeyMeta ?? null));
      }

      const pendingRecoveryKey = sessionStorage.getItem(pendingRecoveryStorageKey);
      if (pendingRecoveryKey && !showRecoveryReveal) {
        setRecoveryKeyReveal(pendingRecoveryKey);
        setShowRecoveryReveal(true);
      }
    };

    init();
  }, [dispatch, navigate, vaultMetaLoaded, showRecoveryReveal]);

  const hasVault = !!vaultMeta?.encryptedDEK;

  const handleSetupVault = async (e) => {
    e.preventDefault();
    if (!masterPassword || masterPassword !== confirmPassword) {
      toast.error("Master passwords do not match");
      return;
    }

    try {
      setIsBusy(true);
      const result = await setupVaultService(masterPassword);
      dispatch(setVaultMeta(result.vaultMeta));
      dispatch(setVaultKeyJwk(result.vaultKeyJwk));
      sessionStorage.setItem(pendingRecoveryStorageKey, result.recoveryKey);
      setRecoveryKeyReveal(result.recoveryKey);
      setShowRecoveryReveal(true);
      toast.success("Vault created");
    } catch (error) {
      toast.error(error.message || "Failed to create vault");
    } finally {
      setIsBusy(false);
    }
  };

  const handleUnlockVault = async (e) => {
    e.preventDefault();
    if (unlockMethod === "master" && !unlockPassword) return;
    if (unlockMethod === "recovery" && !recoveryKeyInput) return;

    try {
      setIsBusy(true);
      const dekJwk =
        unlockMethod === "master"
          ? await unlockVaultService(unlockPassword, vaultMeta)
          : await unlockVaultWithRecoveryService(recoveryKeyInput, vaultMeta);
      dispatch(setVaultKeyJwk(dekJwk));
      toast.success("Vault unlocked");
      navigate("/passwords");
    } catch (error) {
      toast.error(error.message || "Failed to unlock vault");
    } finally {
      setIsBusy(false);
    }
  };

  const handleLockVault = () => {
    dispatch(clearVaultKey());
    setUnlockPassword("");
    setRecoveryKeyInput("");
    toast.success("Vault locked");
  };

  const handleRotateVault = async (e) => {
    e.preventDefault();

    if (!rotateMasterPassword || rotateMasterPassword !== rotateConfirmPassword) {
      toast.error("New master passwords do not match");
      return;
    }

    if (!vaultKeyJwk) {
      toast.error("Unlock the vault before rotating keys");
      return;
    }

    try {
      setIsBusy(true);
      const result = await rotateVaultKeysService(rotateMasterPassword, vaultKeyJwk);
      dispatch(setVaultMeta(result.vaultMeta));
      setRecoveryKeyReveal(result.recoveryKey);
      setShowRecoveryReveal(true);
      sessionStorage.setItem(pendingRecoveryStorageKey, result.recoveryKey);
      setRotateMasterPassword("");
      setRotateConfirmPassword("");
      setShowRotateForm(false);
      toast.success("Vault keys rotated");
    } catch (error) {
      toast.error(error.message || "Failed to rotate vault keys");
    } finally {
      setIsBusy(false);
    }
  };

  if (!vaultMetaLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B1F3B] to-[#4D869C] text-white flex items-center justify-center">
        Loading vault...
      </div>
    );
  }

  return (
    <div className="min-h-[110vh] bg-gradient-to-br from-[#1B1F3B] to-[#4D869C] text-[#F5F7FA] flex flex-col">
      <Dashboard />

      <div className="flex-grow flex flex-col justify-center items-center px-6 py-10">
        {showRecoveryReveal && recoveryKeyReveal ? (
          <div className="w-full max-w-5xl rounded-2xl border border-[#4D869C] bg-gray-800 p-8 shadow-lg">
            <h2 className="text-center text-3xl font-semibold">Save Recovery Key</h2>
            <p className="mt-4 text-center text-gray-300">
              This key can unlock your vault if you forget the master password. Save it offline.
            </p>
            <textarea
              readOnly
              value={recoveryKeyReveal}
              rows={4}
              className="mt-6 w-full rounded-lg bg-gray-700 p-3 text-white outline-none resize-none"
            />
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(recoveryKeyReveal)}
                className="rounded-lg bg-[#3A7CA5] px-6 py-3 font-semibold text-white shadow-lg shadow-[#3A7CA5]/40 transition-all hover:bg-[#81c3d7]"
              >
                Copy Recovery Key
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem(pendingRecoveryStorageKey);
                  setShowRecoveryReveal(false);
                  setRecoveryKeyReveal("");
                  navigate("/passwords");
                }}
                className="rounded-lg bg-[#082d3c] px-6 py-3 font-semibold text-white shadow-lg shadow-[#082d3c]/40 transition-all hover:bg-[#3B6F87]"
              >
                I Saved It
              </button>
            </div>
          </div>
        ) : !hasVault ? (
          <div className="w-full max-w-5xl rounded-2xl border border-[#4D869C] bg-gray-800 p-8 shadow-lg">
            <h2 className="text-center text-3xl font-semibold">Create Vault</h2>
            <p className="mt-4 text-center text-gray-300">
              Set a master password to wrap your vault DEK. This password never leaves your browser.
            </p>
            <form onSubmit={handleSetupVault} className="mt-8 space-y-4">
              <input
                type="password"
                placeholder="Master password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                className="w-full rounded-lg bg-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#81c3d7]"
                required
              />
              <input
                type="password"
                placeholder="Confirm master password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg bg-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#81c3d7]"
                required
              />
              <button
                type="submit"
                disabled={isBusy}
                className="w-full rounded-lg bg-[#3A7CA5] px-6 py-3 font-semibold text-white shadow-lg shadow-[#3A7CA5]/40 transition-all hover:bg-[#81c3d7] disabled:opacity-60"
              >
                {isBusy ? "Creating..." : "Create Vault"}
              </button>
            </form>
          </div>
        ) : !vaultReady ? (
          <div className="w-full max-w-5xl rounded-2xl border border-[#4D869C] bg-gray-800 p-8 shadow-lg">
            <h2 className="text-center text-3xl font-semibold">Unlock Vault</h2>
            <p className="mt-4 text-center text-gray-300">
              Enter your master password or recovery key to unwrap the DEK for this session.
            </p>
            <p className="mt-4 rounded-lg border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
              Vault mode: <span className="font-semibold text-white">{vaultMode}</span>
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setUnlockMethod("master")}
                className={`rounded-lg px-4 py-2 font-semibold ${
                  unlockMethod === "master"
                    ? "bg-[#3A7CA5] text-white"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                Master Password
              </button>
              <button
                type="button"
                onClick={() => setUnlockMethod("recovery")}
                className={`rounded-lg px-4 py-2 font-semibold ${
                  unlockMethod === "recovery"
                    ? "bg-[#3A7CA5] text-white"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                Recovery Key
              </button>
            </div>
            <form onSubmit={handleUnlockVault} className="mt-8 space-y-4">
              {unlockMethod === "master" ? (
                <input
                  type="password"
                  placeholder="Master password"
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  className="w-full rounded-lg bg-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#81c3d7]"
                  required
                />
              ) : (
                <textarea
                  placeholder="Recovery key"
                  value={recoveryKeyInput}
                  onChange={(e) => setRecoveryKeyInput(e.target.value.trim())}
                  rows={4}
                  className="w-full rounded-lg bg-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#81c3d7]"
                  required
                />
              )}
              <button
                type="submit"
                disabled={isBusy}
                className="w-full rounded-lg bg-[#3A7CA5] px-6 py-3 font-semibold text-white shadow-lg shadow-[#3A7CA5]/40 transition-all hover:bg-[#81c3d7] disabled:opacity-60"
              >
                {isBusy ? "Unlocking..." : "Unlock Vault"}
              </button>
            </form>
          </div>
        ) : (
          <div className="w-full max-w-5xl rounded-2xl border border-[#4D869C] bg-gray-800 p-8 shadow-lg">
            <h2 className="text-center text-3xl font-semibold">Vault Unlocked</h2>
            <p className="mt-4 text-center text-gray-300">
              The DEK is loaded in memory for this session only.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setShowRotateForm((prev) => !prev)}
                className="rounded-lg bg-[#3A7CA5] px-6 py-3 font-semibold text-white shadow-lg shadow-[#3A7CA5]/40 transition-all hover:bg-[#81c3d7]"
              >
                Rotate Vault Keys
              </button>
              <button
                type="button"
                onClick={handleLockVault}
                className="rounded-lg bg-[#082d3c] px-6 py-3 font-semibold text-white shadow-lg shadow-[#082d3c]/40 transition-all hover:bg-[#3B6F87]"
              >
                Lock Vault
              </button>
            </div>
            {showRotateForm && (
              <form onSubmit={handleRotateVault} className="mt-6 space-y-4 rounded-xl border border-gray-600 p-4">
                <p className="text-sm text-gray-300">
                  Create a new master password and a new recovery key for the same DEK.
                </p>
                <input
                  type="password"
                  placeholder="New master password"
                  value={rotateMasterPassword}
                  onChange={(e) => setRotateMasterPassword(e.target.value)}
                  className="w-full rounded-lg bg-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#81c3d7]"
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm new master password"
                  value={rotateConfirmPassword}
                  onChange={(e) => setRotateConfirmPassword(e.target.value)}
                  className="w-full rounded-lg bg-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#81c3d7]"
                  required
                />
                <button
                  type="submit"
                  disabled={isBusy}
                  className="w-full rounded-lg bg-[#3A7CA5] px-6 py-3 font-semibold text-white shadow-lg shadow-[#3A7CA5]/40 transition-all hover:bg-[#81c3d7] disabled:opacity-60"
                >
                  {isBusy ? "Rotating..." : "Rotate Keys"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PrivateKey;
