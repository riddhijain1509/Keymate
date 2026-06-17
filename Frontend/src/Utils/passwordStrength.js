const upper = /[A-Z]/;
const lower = /[a-z]/;
const digit = /\d/;
const symbol = /[^A-Za-z0-9]/;

export const evaluatePasswordStrength = (password = "") => {
  const value = String(password);
  const missing = [];

  if (value.length < 12) missing.push("At least 12 characters");
  if (!upper.test(value)) missing.push("One uppercase letter");
  if (!lower.test(value)) missing.push("One lowercase letter");
  if (!digit.test(value)) missing.push("One number");
  if (!symbol.test(value)) missing.push("One symbol");

  if (!value) {
    return {
      score: 0,
      label: "Empty",
      hint: "Add a password to see a strength score",
      color: "bg-slate-500",
      width: "0%",
      missing,
    };
  }

  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (upper.test(value) && lower.test(value)) score += 1;
  if (digit.test(value)) score += 1;
  if (symbol.test(value)) score += 1;

  score = Math.min(score, 4);

  const palette = [
    { label: "Very weak", hint: "Use at least 12 characters with mixed types", color: "bg-red-500" },
    { label: "Weak", hint: "Add more length and a few symbols", color: "bg-orange-500" },
    { label: "Good", hint: "This is workable, but can still be stronger", color: "bg-yellow-500" },
    { label: "Strong", hint: "Nice. This has good length and variety", color: "bg-lime-500" },
    { label: "Very strong", hint: "Excellent. Long, mixed, and hard to guess", color: "bg-emerald-500" },
  ];

  const meta = palette[score] ?? palette[0];

  return {
    score,
    label: meta.label,
    hint: meta.hint,
    color: meta.color,
    width: `${Math.max(10, score * 25)}%`,
    missing,
  };
};

export const generateStrongPassword = (length = 20) => {
  const safeLength = Math.max(12, length);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{};:,.?/";
  const values = new Uint32Array(safeLength);
  const crypto = globalThis.crypto;
  if (!crypto?.getRandomValues) {
    throw new Error("Secure random generation is not available in this environment");
  }

  crypto.getRandomValues(values);

  let password = "";
  for (let i = 0; i < safeLength; i += 1) {
    password += chars[values[i] % chars.length];
  }

  return password;
};
