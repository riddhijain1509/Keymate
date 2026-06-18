import { describe, expect, it } from "vitest";
import { buildAuditEvent } from "./auditEvent.js";

describe("buildAuditEvent", () => {
  it("removes secret fields from metadata", () => {
    const event = buildAuditEvent({
      type: "password_updated",
      metadata: {
        password: "secret",
        token: "secret-token",
        ciphertext: "ciphertext-value",
        websiteName: "Example",
        passwordId: "abc123",
      },
    });

    expect(event.metadata.password).toBeUndefined();
    expect(event.metadata.token).toBeUndefined();
    expect(event.metadata.ciphertext).toBeUndefined();
    expect(event.metadata.websiteName).toBe("Example");
    expect(event.metadata.passwordId).toBe("abc123");
  });
});
