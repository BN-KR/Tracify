import { handler } from "@/lib/auth-server";

// Behind the Coolify/Caddy proxy the app sees itself as localhost:3000, which
// made Google's callback point at localhost. Rebuild the request on the public host.
function withPublicHost(request: Request): Request {
  const headers = request.headers;
  const host = headers.get("x-forwarded-host") || headers.get("host");
  if (!host || /^(localhost|127\.0\.0\.1)(:|$)/.test(host)) return request;
  const url = new URL(request.url);
  url.protocol = "https:";
  url.host = host;
  return new Request(url, request);
}

export const GET = (request: Request) => handler.GET(withPublicHost(request) as never);
export const POST = (request: Request) => handler.POST(withPublicHost(request) as never);
