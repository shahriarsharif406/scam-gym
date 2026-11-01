'use strict';
// Shared helpers: Gemini call, rate limit, body parsing. (Leading "_" => not a public route on Vercel.)

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const hits = new Map();

function limited(req, max = 30, windowMs = 60000) {
  const ip = String((req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'x')).split(',')[0].trim();
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return arr.length > max;
}

function body(req) {
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  return b && typeof b === 'object' ? b : {};
}

const clip = (s, n) => String(s == null ? '' : s).slice(0, n);

function parseJSON(t) {
  try { return JSON.parse(t); } catch (e) { /* try fence strip */ }
  const m = String(t).match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch (e) { /* fallthrough */ } }
  return null;
}

async function gemini({ system, contents, temperature = 0.8, maxOutputTokens = 700 }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) { const e = new Error('AI not configured'); e.status = 503; throw e; }
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      signal: ctl.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { temperature, maxOutputTokens, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } }
      })
    });
    if (!r.ok) { const e = new Error('AI upstream error'); e.status = 502; throw e; }
    const j = await r.json();
    const t = j?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
    const out = parseJSON(t);
    if (!out) { const e = new Error('AI returned invalid output'); e.status = 502; throw e; }
    return out;
  } catch (e) {
    if (e.name === 'AbortError') { const x = new Error('AI timeout'); x.status = 504; throw x; }
    throw e;
  } finally { clearTimeout(to); }
}

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

module.exports = { gemini, limited, body, clip, send };
