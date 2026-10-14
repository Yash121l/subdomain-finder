// Cloudflare Pages Function: reverse proxy for PostHog so ad blockers
// don't drop analytics. /ingest/static/* -> assets host, /ingest/* -> ingest host.
const API_HOST = "us.i.posthog.com";
const ASSET_HOST = "us-assets.i.posthog.com";

type PagesContext = { request: Request };

export const onRequest = async ({ request }: PagesContext): Promise<Response> => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/ingest/, "") || "/";
  const targetHost = path.startsWith("/static/") ? ASSET_HOST : API_HOST;
  const target = new URL(path + url.search, `https://${targetHost}`);

  const headers = new Headers(request.headers);
  headers.delete("cookie");
  headers.set("host", targetHost);
  const ip = request.headers.get("cf-connecting-ip");
  if (ip) headers.set("x-forwarded-for", ip);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "follow",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(target.toString(), init);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("set-cookie");
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
};
