import { useState } from "react";
import { generateStrongPassword, evaluatePasswordStrength } from "../../Utils/passwordStrength.js";

const PasswordStrengthPanel = ({ value, onUseSuggestion }) => {
  const [suggestedPassword, setSuggestedPassword] = useState("");
  const strength = evaluatePasswordStrength(value);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-200">Password strength</p>
          <p className="mt-1 text-xs text-slate-400">{strength.hint}</p>
        </div>
        <span className="text-sm font-semibold text-white">{strength.label}</span>
      </div>

      <div className="mt-3 h-2 w-full rounded-full bg-white/10">
        <div className={`h-2 rounded-full ${strength.color}`} style={{ width: strength.width }} />
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-200">Missing items</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {strength.missing.length > 0 ? (
            strength.missing.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-200"
              >
                {item}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
              Password meets the basic strength rules
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            const nextPassword = generateStrongPassword();
            setSuggestedPassword(nextPassword);
            onUseSuggestion(nextPassword);
          }}
          className="rounded-lg bg-[#082d3c] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#3B6F87]"
        >
          Suggest strong password
        </button>
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(value || suggestedPassword || generateStrongPassword())}
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition-all hover:bg-white/10"
        >
          Copy password
        </button>
      </div>

      {suggestedPassword && (
        <div className="mt-4 rounded-xl border border-[#81c3d7]/20 bg-black/20 p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-[#81c3d7]">Suggested password</div>
          <textarea
            readOnly
            value={suggestedPassword}
            rows={2}
            className="mt-2 w-full resize-none rounded-lg bg-[#0f172a] px-3 py-2 text-sm text-white outline-none"
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onUseSuggestion(suggestedPassword)}
              className="rounded-lg bg-[#3A7CA5] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#81c3d7]"
            >
              Use this password
            </button>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(suggestedPassword)}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition-all hover:bg-white/10"
            >
              Copy suggested
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthPanel;
