import { NextRequest } from "next/server";
import { handlers } from "@/auth";

function normalizeOrigin(req: NextRequest): NextRequest {
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto =
    req.headers.get("x-forwarded-proto") ?? "http";
  if (!host) return req;
  try {
    const base = new URL(req.url);
    const target = new URL(req.url);
    target.host = host;
    if (proto) {
      target.protocol = proto.endsWith(":") ? proto : `${proto}:`;
    }
    if (target.href !== base.href) {
      return new NextRequest(target, req);
    }
  } catch {
    return req;
  }
  return req;
}

// Rewrites the internal request origin to match the incoming Host header,
// so Auth.js builds callback/signin/redirect URLs against the host the
// client actually used (localhost, a LAN IP, or a public domain) instead
// of the Next.js-internal `localhost` URL.
export const GET = (req: NextRequest) => handlers.GET(normalizeOrigin(req));
export const POST = (req: NextRequest) => handlers.POST(normalizeOrigin(req));
