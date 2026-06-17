import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Dashboard from "../Dashboard.jsx";
import toast from "react-hot-toast";
import { setVaultKeyJwk } from "../../Features/todoslice.js";
import Footer from "../Footer.jsx";
import { replaceLocalVaultKey } from "../../Service/VaultBootstrap.service.js";

const PrivateKey = () => {
  const vaultKeyJwk = useSelector((state) => state.vaultKeyJwk);
  const vaultMode = useSelector((state) => state.vaultMode);
  const [showVaultKey, setShowVaultKey] = useState(false);
  const dispatch = useDispatch();

  const changeKeys = async () => {
    const confirmed = window.confirm(
      "Regenerating the vault key will make existing encrypted passwords unreadable. Continue?"
    );

    if (!confirmed) return;

    const vaultMeta = await replaceLocalVaultKey();
    dispatch(setVaultKeyJwk(vaultMeta.dekJwk));
    toast.success("Vault key regenerated successfully");
  };

  const getMaskedKey = (key, show) =>
    show ? key : "**************************************************************************************\n".repeat(18);

  return (
    <div className="min-h-[110vh] bg-gradient-to-br from-[#1B1F3B] to-[#4D869C] text-[#F5F7FA] flex flex-col">
      <Dashboard />

      <div className="flex-grow flex flex-col justify-center items-center px-6 py-10">
        <div className="w-full max-w-5xl rounded-2xl border border-[#4D869C] bg-gray-800 p-8 shadow-lg">
          <h2 className="text-center text-3xl font-semibold">Vault Settings</h2>
          <p className="mt-4 text-center text-gray-300">
            Vault mode: <span className="font-semibold text-white">{vaultMode}</span>
          </p>
          <p className="mt-4 rounded-lg border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            Phase 1 stores a local development DEK in this browser. Regenerating it will make
            any existing encrypted password entries unreadable until you start fresh.
          </p>
          <div className="relative mt-6">
            <textarea
              value={getMaskedKey(JSON.stringify(vaultKeyJwk, null, 2), showVaultKey)}
              readOnly
              rows={20}
              className="w-full rounded-lg bg-gray-700 p-3 text-white outline-none resize-none"
            />
            <button
              type="button"
              onClick={() => setShowVaultKey(!showVaultKey)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              {showVaultKey ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button
          onClick={changeKeys}
          className="mt-10 mx-20 bg-[#082d3c] text-white px-6 py-3 w-[1000px] max-w-full rounded-lg shadow-lg shadow-[#082d3c]/50 hover:bg-[#3B6F87] transition-all text-lg font-semibold"
        >
          Regenerate Vault Key
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default PrivateKey;
