import { describe, it, expect, vi, beforeEach } from "vitest";

// Stub createUser so we can simulate a Postgres failure without a live DB.
const createUserMock = vi.fn();

vi.mock("@/lib/users", () => ({
  createUser: (...args: unknown[]) => createUserMock(...args),
}));

import { POST } from "@/app/api/register/route";

function post(body: unknown): Request {
  return new Request("http://localhost/api/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  createUserMock.mockReset();
});

describe("POST /api/register error handling", () => {
  it("returns a generic 500 and never leaks SQL / connection / stack on DB failure", async () => {
    createUserMock.mockRejectedValue(
      new Error(
        "connection refused on postgres://hunter2:secret@db.internal:5432/bitim?sslmode=require (SQLSTATE 08006)"
      )
    );

    const res = await POST(post({ name: "A", email: "a@x.com", password: "password1" }));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe(
      "Something went wrong on our end. Please try again."
    );
    const raw = JSON.stringify(body).toLowerCase();
    expect(raw).not.toContain("postgres");
    expect(raw).not.toContain("hunter2");
    expect(raw).not.toContain("08006");
    expect(raw).not.toContain("connection string");
  });

  it("returns the existing-account error surfaced from createUser as 400", async () => {
    createUserMock.mockResolvedValue({
      error: "An account with this email already exists.",
    });
    const res = await POST(post({ name: "A", email: "dup@x.com", password: "password1" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("An account with this email already exists.");
  });
});