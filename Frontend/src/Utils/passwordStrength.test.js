import test from "node:test";
import assert from "node:assert/strict";
import { evaluatePasswordStrength, generateStrongPassword } from "./passwordStrength.js";

test("reports missing password requirements", () => {
  const result = evaluatePasswordStrength("abc");

  assert.ok(result.missing.includes("At least 12 characters"));
  assert.ok(result.missing.includes("One uppercase letter"));
  assert.ok(result.missing.includes("One number"));
  assert.ok(result.missing.includes("One symbol"));
});

test("detects a strong password", () => {
  const result = evaluatePasswordStrength("StrongPass123!");

  assert.equal(result.label, "Very strong");
  assert.equal(result.missing.length, 0);
});

test("generates a password with a minimum length", () => {
  const password = generateStrongPassword(16);

  assert.equal(password.length, 16);
});
