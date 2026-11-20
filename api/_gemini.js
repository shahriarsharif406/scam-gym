'use strict';
// Shared helpers: Gemini call, rate limit, body parsing. (Leading "_" => not a public route on Vercel.)

const MODELS = [process.env.GEMINI_MODEL, 'gemini-2.5-flash'].filter(Boolean);
const hits = new Map();
let discovered = null;

// Pick the newest stable text "flash" model this key can use (model names get retired over time).
async function discover(key) {
  if (discovered) return discovered;
  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': key }, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return [];
    const j = await r.json();
    const ok = (j.models || []).filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m) => String(m.name).replace(/^models\//, ''))
      .filter((n) => /^gemini-[\d.]+-flash(-lite)?$/.test(n));
    const ver = (n) => parseFloat(n.split('-')[1]) * 10 + (n.endsWith('lite') ? 0 : 5);
    discovered = ok.sort((a, b) => ver(b) - ver(a));
    console.error('Gemini discovered models', discovered.join(','));
  } catch (e) { discovered = null; }
  return discovered || [];
}

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
  const to = setTimeout(() => ctl.abort(), 25000);
  try {
    let r = null;
    const tried = new Set();
    const queue = discovered && discovered.length ? [...discovered] : [...MODELS];
    let again = false;
    for (let i = 0; i < queue.length; i++) {
      const m = queue[i]; tried.add(m);
      try { r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: 'POST',
        signal: AbortSignal.any([ctl.signal, AbortSignal.timeout(11000)]),
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: m.startsWith('gemini-2')
            ? { temperature, maxOutputTokens, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } }
            : { temperature, maxOutputTokens: maxOutputTokens + 1500, responseMimeType: 'application/json' }
        })
      });
      } catch (e) { if (e.name !== 'TimeoutError' && !(e.name === 'AbortError' && !ctl.signal.aborted)) throw e; console.error('Gemini attempt timeout', m); r = null; continue; }
      if (r.ok) break;
      let t = ''; try { t = (await r.text()).slice(0, 300); } catch (e) { /* ignore */ }
      console.error('Gemini upstream', m, r.status, t);
      if (r.status === 401 || r.status === 403) break; // key problem: other models will fail too
      if (r.status === 404 && !again) { again = true; const d = await discover(key); for (const n of d) if (!tried.has(n)) queue.push(n); }
    }
    if (!r || !r.ok) { const e = new Error('AI upstream error'); e.status = 502; throw e; }
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
