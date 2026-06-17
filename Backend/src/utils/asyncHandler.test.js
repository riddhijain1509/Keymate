import { describe, expect, it, vi } from "vitest";
import { asyncHandler } from "./asyncHandler.js";

describe("asyncHandler", () => {
  it("forwards thrown errors to next", async () => {
    const next = vi.fn();
    const handler = asyncHandler(async () => {
      throw new Error("boom");
    });

    await handler({}, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(next.mock.calls[0][0].message).toBe("boom");
  });
});
