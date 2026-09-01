import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/security", async (importOriginal) => {
  const mod = (await importOriginal()) as Record<string, unknown>;
  return {
    ...mod,
    // Deterministic, generous allowance for the small number of route calls below.
    assessRateLimited: vi.fn(async () => ({ ok: true, retryAfterSeconds: 0 })),
    registerRateLimited: vi.fn(async () => ({ ok: true, retryAfterSeconds: 0 })),
  };
});

import { POST } from "@/app/api/assess/route";

const IT_WORK = "IT-permesso-soggiorno-lavoro";
const IT_REUNION = "IT-ricongiungimento-familiare";

function jsonResponse(res: Response) {
  return { status: res.status, body: res.json() };
}

const profile = {
  country: "Italia",
  destination: "IT",
  nationality: "Marocco",
  situation: "lavoro",
};

function makeRequest(body: unknown, contentType = "application/json"): Request {
  return new Request("http://localhost/api/assess", {
    method: "POST",
    headers: contentType ? { "content-type": contentType } : {},
    body: contentType ? JSON.stringify(body) : undefined,
  });
}

describe("POST /api/assess requires an explicit procedureId", () => {
  it("Test 5 — missing procedureId returns 400 (no default procedure)", async () => {
    const { status, body } = jsonResponse(await POST(makeRequest({ profile })));
    expect(status).toBe(400);
    const parsed = await body;
    expect(parsed.error).toBeTruthy();
  });

  it("Test 9 — legacy profile with NO procedureId still 400 (not mapped to first procedure)", async () => {
    // A category-only legacy payload must NOT be auto-resolved to PROCEDURES[0].
    const { status, body } = jsonResponse(
      await POST(makeRequest({ profile: { ...profile, category: "residency" } }))
    );
    expect(status).toBe(400);
    const parsed = await body;
    expect(parsed.error).toBeTruthy();
  });

  it("Test 12 — unknown procedureId returns 404 (no fallback)", async () => {
    const { status, body } = jsonResponse(
      await POST(makeRequest({ procedureId: "does-not-exist", profile }))
    );
    expect(status).toBe(404);
    const parsed = await body;
    expect(parsed.error).toBeTruthy();
  });

  it("Test 13 — valid procedureId returns 200 with the exact procedure", async () => {
    const { status, body } = jsonResponse(
      await POST(makeRequest({ procedureId: IT_REUNION, profile }))
    );
    expect(status).toBe(200);
    const parsed = await body;
    expect(parsed.procedureId).toBe(IT_REUNION);
    expect(parsed.procedure.id).toBe(IT_REUNION);
    // Distinct dataset returned, not the residence permit.
    expect(parsed.procedure.id).not.toBe(IT_WORK);
  });

  it("Test 13b — different procedures yield different route datasets", async () => {
    const a = (await (await POST(makeRequest({ procedureId: IT_WORK, profile }))).json()) as any;
    const b = (await (await POST(makeRequest({ procedureId: IT_REUNION, profile }))).json()) as any;
    expect(a.procedure.id).toBe(IT_WORK);
    expect(b.procedure.id).toBe(IT_REUNION);
    const idsA = new Set((a.documents as any[]).map((d) => d.item.id));
    const idsB = new Set((b.documents as any[]).map((d) => d.item.id));
    expect(idsA.has("contratto")).toBe(true);
    expect(idsB.has("certificato-matrimonio")).toBe(true);
  });
});