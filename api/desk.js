const UPSTREAM = "https://jarir-store.netlify.app/api/desk";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Cache-Control", "no-store");
}

export default async function handler(req, res) {
  cors(res);
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
    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await upstream.json();
    res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error?.message || error) });
  }
}
