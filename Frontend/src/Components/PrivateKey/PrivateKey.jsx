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
  unlockVaultService,
} from "../../Service/VaultBootstrap.service.js";
import { useNavigate } from "react-router-dom";
import { checkisloggedIn } from "../../Service/Auth.service.js";

const PrivateKey = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const vaultMode = useSelector((state) => state.vaultMode);
  const vaultMeta = useSelector((state) => state.vaultMeta);
  const vaultMetaLoaded = useSelector((state) => state.vaultMetaLoaded);
  const vaultReady = useSelector((state) => state.vaultReady);
  const [masterPassword, setMasterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [unlockPassword, setUnlockPassword] = useState("");
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
    };

    init();
  }, [dispatch, navigate, vaultMetaLoaded]);

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
      toast.success("Vault created and unlocked");
      navigate("/passwords");
    } catch (error) {
      toast.error(error.message || "Failed to create vault");
    } finally {
      setIsBusy(false);
    }
  };

  const handleUnlockVault = async (e) => {
    e.preventDefault();
    if (!unlockPassword) return;

    try {
      setIsBusy(true);
      const dekJwk = await unlockVaultService(unlockPassword, vaultMeta);
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
    toast.success("Vault locked");
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
        {!hasVault ? (
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
              Enter your master password to unwrap the DEK for this session.
            </p>
            <p className="mt-4 rounded-lg border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
              Vault mode: <span className="font-semibold text-white">{vaultMode}</span>
            </p>
            <form onSubmit={handleUnlockVault} className="mt-8 space-y-4">
              <input
                type="password"
                placeholder="Master password"
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                className="w-full rounded-lg bg-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#81c3d7]"
                required
              />
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
                onClick={handleLockVault}
                className="rounded-lg bg-[#082d3c] px-6 py-3 font-semibold text-white shadow-lg shadow-[#082d3c]/40 transition-all hover:bg-[#3B6F87]"
              >
                Lock Vault
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PrivateKey;
