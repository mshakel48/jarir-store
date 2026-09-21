const UPSTREAM = "https://jarir-store.netlify.app/api/desk";

const ALLOWED = new Set([
  "https://jarir.world",
  "https://www.jarir.world",
  "https://jarir-store.netlify.app",
]);

function cors(req, res) {
  const origin = req.headers.origin || "";
  res.setHeader("Access-Control-Allow-Origin", ALLOWED.has(origin) ? origin : "https://jarir-store.netlify.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type, x-desk-key, authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Origin");
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS" || req.method === "HEAD") {
    res.status(204).end();
    return;
  }

  try {
    let payload = { op: "list" };
    if (req.method === "POST") {
      if (typeof req.body === "string" && req.body) payload = JSON.parse(req.body);
      else if (req.body && typeof req.body === "object") payload = req.body;
    }
    const headers = { "content-type": "application/json" };
    const key = req.headers["x-desk-key"] || (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (key) headers["x-desk-key"] = key;
    const upstream = await fetch(UPSTREAM, {
      method: req.method === "GET" ? "GET" : "POST",
      headers,
      body: req.method === "GET" ? undefined : JSON.stringify(payload),
    });
    const data = await upstream.json();
    res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error?.message || error) });
  }
}
