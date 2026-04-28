export const cfg = { runtime: "edge" };

const BASE_URL = (process.env.TARGET_DOMAIN || "").replace(/\/$/, "");

const SKIP_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "forwarded",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-port",
]);

export default async function handler(req) {
  if (!BASE_URL) {
    return new Response("errror in chiye zadi TARGET_DOMAIN, dadash", { status: 500 });
  }

  try {
    const idx = req.url.indexOf("/", 8);
    const target =
      idx === -1 ? BASE_URL + "/" : BASE_URL + req.url.slice(idx);

    const hdrs = new Headers();
    let clientIp = null;

    for (const [k, v] of req.headers) {
      if (SKIP_HEADERS.has(k)) continue;
      if (k.startsWith("x-vercel-")) continue;

      if (k === "x-real-ip") {
        clientIp = v;
        continue;
      }

      if (k === "x-forwarded-for") {
        if (!clientIp) clientIp = v;
        continue;
      }

      hdrs.set(k, v);
    }

    if (clientIp) {
      hdrs.set("x-forwarded-for", clientIp);
    }

    const m = req.method;
    const hasBody = m !== "GET" && m !== "HEAD";

    return await fetch(target, {
      method: m,
      headers: hdrs,
      body: hasBody ? req.body : undefined,
      duplex: "half",
      redirect: "manual",
    });
  } catch (err) {
    console.error("nA IN Moshkel dare", err);
    return new Response("daDash ye jaye kar eraaad dasht...", { status: 502 });
  }
}
