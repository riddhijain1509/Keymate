import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUserApi = vi.hoisted(() => ({
  findOne: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
}));

vi.mock("../models/user.model.js", () => ({
  User: mockUserApi,
}));

vi.mock("../utils/auditStream.js", () => ({
  queueAuditEvent: vi.fn().mockResolvedValue({ queued: false, persistedDirectly: false }),
}));

import { registerUser } from "./user.controller.js";

const createResponseMock = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new user when one does not already exist", async () => {
    const savedUser = {
      _id: "user-1",
      fullname: "Test User",
      username: "testuser",
      email: "test@example.com",
    };

    mockUserApi.findOne.mockResolvedValue(null);
    mockUserApi.create.mockResolvedValue({ _id: savedUser._id });
    mockUserApi.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue(savedUser),
    });

    const req = {
      body: {
        fullname: savedUser.fullname,
        username: savedUser.username,
        email: savedUser.email,
        password: "Password123!",
      },
    };
    const res = createResponseMock();
    const next = vi.fn();

    await registerUser(req, res, next);

    expect(mockUserApi.findOne).toHaveBeenCalledTimes(1);
    expect(mockUserApi.create).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it("returns 400 if the user already exists", async () => {
    mockUserApi.findOne.mockResolvedValue({ _id: "existing-user" });

    const req = {
      body: {
        fullname: "Existing User",
        username: "existing",
        email: "existing@example.com",
        password: "Password123!",
      },
    };
    const res = createResponseMock();
    const next = vi.fn();

    await registerUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    expect(mockUserApi.create).not.toHaveBeenCalled();
  });
});
