/* Scam Gym — অ্যাপ লজিক */
(function () {
  'use strict';
  const SG = window.SG, SC = SG.scanner;
  const V = document.getElementById('view');
  const FAST = !!window.SG_FAST;
  const wait = (ms) => new Promise((r) => setTimeout(r, FAST ? 0 : ms));

  /* ---------- utils ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let LANG = 'bn';
  const bn = (n) => (LANG === 'en' ? String(n) : String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]));
  const L = (b, e) => (LANG === 'en' ? e : b);
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const stripQ = (s) => s.replace(/^["“]+|["”]+$/g, '');
  let cleanup = null;
  function rosette(o) {
    o = Object.assign({ n: 28, rx: 46, ry: 18, sw: 0.5, rings: 1 }, o); let t = '';
    for (let i = 0; i < o.n; i++) t += `<ellipse cx="50" cy="50" rx="${o.rx}" ry="${o.ry}" transform="rotate(${((i * 180) / o.n).toFixed(2)} 50 50)"/>`;
    if (o.rings > 1) for (let i = 0; i < o.n; i++) t += `<ellipse cx="50" cy="50" rx="${(o.rx * 0.62).toFixed(1)}" ry="${(o.ry * 1.6).toFixed(1)}" transform="rotate(${((i * 180) / o.n + 90 / o.n).toFixed(2)} 50 50)"/>`;
    return `<svg viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="${o.sw}">${t}</svg>`;
  }

  function toast(msg, bad) {
    const box = $('#toasts'); if (!box) return;
    const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = msg; box.appendChild(t);
    setTimeout(() => t.remove(), FAST ? 50 : 3200);
  }

  /* ---------- i18n (বাংলা ⇄ English) ---------- */
  const EN_KEYS = Object.keys(SG.EN_SUB || {}).sort((a, b) => b.length - a.length);
  const DIG = '০১২৩৪৫৬৭৮৯';
  function tx(s) {
    if (LANG !== 'en' || !s) return s;
    const tr = String(s), t0 = tr.trim();
    if (SG.EN_EXACT && SG.EN_EXACT[t0]) return tr.replace(t0, SG.EN_EXACT[t0]);
    let t = tr;
    for (let i = 0; i < EN_KEYS.length; i++) { const k = EN_KEYS[i]; if (t.indexOf(k) !== -1) t = t.split(k).join(SG.EN_SUB[k]); }
    (SG.EN_PAT || []).forEach((p) => { t = t.replace(new RegExp(p[0], 'g'), p[1]); });
    return t.replace(/[০-৯]/g, (d) => DIG.indexOf(d));
  }
  const ORIG = new WeakMap(), ORIGA = new WeakMap();
  const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  function trTree(root) {
    if (!root) return;
    const w = document.createTreeWalker(root, 4);
    let n;
    while ((n = w.nextNode())) {
      const p = n.parentNode; if (p && /^(SCRIPT|STYLE)$/.test(p.nodeName)) continue;
      if (!ORIG.has(n)) ORIG.set(n, n.nodeValue);
      const o = ORIG.get(n), t = LANG === 'en' ? tx(o) : o;
      if (n.nodeValue !== t) n.nodeValue = t;
    }
    const els = root.querySelectorAll ? root.querySelectorAll('[placeholder],[title],[aria-label],[alt]') : [];
    els.forEach((el) => {
      let m = ORIGA.get(el); if (!m) { m = {}; ORIGA.set(el, m); }
      ATTRS.forEach((a) => { if (!el.hasAttribute(a)) return; if (m[a] === undefined) m[a] = el.getAttribute(a); const t = LANG === 'en' ? tx(m[a]) : m[a]; if (el.getAttribute(a) !== t) el.setAttribute(a, t); });
    });
  }
  let trQueued = false;
  function trSoon() { if (LANG !== 'en' || trQueued) return; trQueued = true; Promise.resolve().then(() => { trQueued = false; trTree(document.body); }); }
  const TITLE0 = document.title;
  function applyLang() {
    document.documentElement.lang = LANG;
    document.title = LANG === 'en' ? tx(TITLE0) : TITLE0;
    const lb = document.getElementById('langBtn'); if (lb) { lb.textContent = LANG === 'en' ? 'বাং' : 'EN'; lb.setAttribute('aria-label', LANG === 'en' ? 'বাংলায় দেখুন' : 'View in English'); lb.title = lb.getAttribute('aria-label'); }
    trTree(document.body);
  }

  /* ---------- store ---------- */
  const KEY = 'scamgym.v1';
  const defaults = () => ({ xp: 0, streak: 0, lastDay: '', done: {}, badges: {}, scans: 0, spotBest: 0, codeword: '', big: false, exits: 0, dailyClaimed: '', wins: 0, plays: 0, audit: {}, tac: {}, fam: [], lookBest: 0, voiceWins: 0, tourDone: false, lang: 'bn', name: '', serial: String(Math.floor(100000 + Math.random() * 899999)) });
  let S = (() => { try { return Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return defaults(); } })();
  try { const q = (location.search + location.hash).match(/[?&]lang=(en|bn)/); if (q) S.lang = q[1]; } catch (e) { /* ignore */ }
  LANG = S.lang === 'en' ? 'en' : 'bn';
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };
  if (!S.audit || typeof S.audit !== 'object') S.audit = {};
  if (!S.tac || typeof S.tac !== 'object') S.tac = {};
  if (!Array.isArray(S.fam)) S.fam = [];
  save();
  const dayKey = (d) => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  function touchDay() {
    const now = new Date(), t = dayKey(now);
    if (S.lastDay === t) return;
    const y = new Date(now.getTime() - 864e5);
    S.streak = S.lastDay === dayKey(y) ? S.streak + 1 : 1; S.lastDay = t; save();
  }
  const dailyScenario = () => SG.SCENARIOS[Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5) % SG.SCENARIOS.length];

  function rankInfo(xp) {
    let i = 0; SG.RANKS.forEach((r, k) => { if (xp >= r.xp) i = k; });
    const cur = SG.RANKS[i], nx = SG.RANKS[i + 1];
    return { i, cur, nx, pct: nx ? Math.round(((xp - cur.xp) / (nx.xp - cur.xp)) * 100) : 100 };
  }
  function addXP(n) {
    const b = rankInfo(S.xp).i; S.xp += n; save(); toast('+' + bn(n) + ' XP ⚡');
    const a = rankInfo(S.xp).i; if (a > b) toast('🎉 র‍্যাংক আপ: ' + SG.RANKS[a].i + ' ' + SG.RANKS[a].n);
  }
  function award(id) {
    if (S.badges[id]) return; S.badges[id] = 1; save();
    const b = SG.BADGES.find((x) => x.id === id); if (b) toast('🏅 নতুন ব্যাজ: ' + b.i + ' ' + b.n);
  }

  /* ---------- AI helpers ---------- */
  let aiP = null;
  function aiStatus() {
    if (!aiP) aiP = (typeof fetch === 'function' ? fetch('/api/chat', { method: 'GET' }).then((r) => (r.ok ? r.json() : { ai: false })).then((j) => !!(j && j.ai)).catch(() => false) : Promise.resolve(false));
    return aiP;
  }
  async function aiCall(path, payload) {
    const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ lang: LANG }, payload)) });
    let j = null; try { j = await r.json(); } catch (e) { /* ignore */ }
    if (!r.ok) { const err = new Error((j && j.error) || 'HTTP ' + r.status); err.status = r.status; throw err; }
    return j;
  }
  function speak(text) {
    try {
      if (!('speechSynthesis' in window)) return toast('এই ডিভাইসে ভয়েস সাপোর্ট নেই', true);
      const u = new SpeechSynthesisUtterance(tx(text)); u.lang = LANG === 'en' ? 'en-US' : 'bn-BD';
      const v = speechSynthesis.getVoices().find((x) => (LANG === 'en' ? /^en/i : /^bn/i).test(x.lang)); if (v) u.voice = v;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) { toast('ভয়েস চালানো যায়নি', true); }
  }
  const waShare = (text) => window.open('https://wa.me/?text=' + encodeURIComponent(tx(text)), '_blank', 'noopener');
  async function copy(text) {
    try { await navigator.clipboard.writeText(tx(text)); toast('কপি হয়েছে ✅'); }
    catch (e) { const ta = document.createElement('textarea'); ta.value = tx(text); document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('কপি হয়েছে ✅'); } catch (e2) { toast('কপি করা যায়নি', true); } ta.remove(); }
  }
  const stars = (n, max = 3) => '<span class="stars">' + '★'.repeat(n) + '<span class="o">' + '★'.repeat(max - n) + '</span></span>';

  /* ---------- router ---------- */
  const VIEWS = {};
  const GROUP = { play: 'arena', spot: 'more', library: 'more', shield: 'more', triage: 'more', audit: 'more', pause: 'more', cert: 'more', me: 'more', voice: 'arena', lookalike: 'scan', secret: 'more', alerts: 'more' };
  function setNav(n) {
    const g = GROUP[n] || n;
    $$('#dnav [data-r], #bnav [data-r]').forEach((a) => a.classList.toggle('on', a.dataset.r === g));
  }
  function closeMore() { const m = $('#more'); if (m) { m.hidden = true; $('#moreBtn').setAttribute('aria-expanded', 'false'); } }
  function route() {
    const h = (location.hash || '#/home').replace(/^#\/?/, '');
    const [n, ...a] = h.split('/');
    if (cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; }
    const f = VIEWS[n] || VIEWS.home;
    setNav(VIEWS[n] ? n : 'home'); closeMore();
    V.style.animation = 'none'; void V.offsetWidth; V.style.animation = '';
    V.innerHTML = '';
    try { f(...a.map(decodeURIComponent)); } catch (e) { console.error(e); V.innerHTML = '<div class="card">কিছু একটা ভুল হয়েছে। <a class="btn sm" href="#/home">হোমে যান</a></div>'; }
    try { window.scrollTo(0, 0); } catch (e) { /* ignore */ }
  }

  /* =========================================================
     HOME
  ========================================================= */
  VIEWS.home = function () {
    const ri = rankInfo(S.xp), d = dailyScenario();
    const tip = SG.TIPS[Math.floor(Date.now() / 864e5) % SG.TIPS.length];
    const dailyDone = S.dailyClaimed === dayKey(new Date());
    const T = (href, ico, h, p, cls) => `<a class="tile ${cls || ''}" href="${href}"><span class="ti">${ico}</span><h3>${h}</h3><p>${p}</p></a>`;
    V.innerHTML = `
    <section class="hero">
      <div class="rosette" aria-hidden="true">${rosette({ n: 40, rx: 48, ry: 16, sw: 0.35, rings: 2 })}</div>
      <div class="hero-in">
        <h1>প্রতারকের মুখোমুখি হওয়ার আগে, এখানে অনুশীলন করুন।</h1>
        <p>AI প্রতারক সেজে আপনাকে ফাঁদে ফেলার চেষ্টা করবে, আর আপনি শিখবেন কীভাবে ঠেকাতে হয়। সন্দেহজনক মেসেজ যাচাই করুন, টাকা পাঠানোর আগে থামুন, বিপদে SOS গাইড খুলুন।</p>
        <div class="row"><a class="btn pri" href="#/arena">অ্যারেনায় নামুন</a><a class="btn" href="#/scan">মেসেজ স্ক্যান করুন</a><a class="btn" href="#/triage">এখন কি প্রতারিত হচ্ছি?</a><a class="btn" href="#/tour">${L('▶ ৯০ সেকেন্ডের ডেমো', '▶ 90-second demo')}</a></div>
      </div>
      <div class="micro" aria-hidden="true">${'স্ক্যাম জিম প্রশিক্ষণ নোট নমুনা '.repeat(60)}</div>
    </section>

    ${SG.alertStrip ? SG.alertStrip() : ''}
    <div class="grid g3" style="margin-top:20px">
      <div class="card"><div class="lvl"><div class="ico">${ri.cur.i}</div>
        <div style="flex:1"><div class="row sp"><b style="font-family:var(--disp)">${ri.cur.n}</b><span class="sm mut">${bn(S.xp)} XP</span></div>
        <div class="bar" style="margin:8px 0 4px"><i style="width:${ri.pct}%"></i></div><span class="sm mut">${ri.nx ? 'পরের র‍্যাংক: ' + ri.nx.n : 'সর্বোচ্চ র‍্যাংক'} · স্ট্রিক ${bn(S.streak)} দিন</span>
        <div class="serial">ক্রমিক নং SG-${bn(S.serial)}</div><a class="sm" href="#/me" style="font-weight:600;display:inline-block;margin-top:4px">${L('প্রোফাইল ও ব্যাজ ›', 'Profile and badges ›')}</a></div></div></div>
      <a class="card daily" href="#/play/${d.id}" style="display:block"><div class="row sp"><span class="pill warn">আজকের চ্যালেঞ্জ</span>${dailyDone ? '<span class="pill ok">সম্পন্ন</span>' : '<span class="pill acc">+৫০ বোনাস XP</span>'}</div>
        <h3 style="margin:10px 0 3px">${d.icon} ${esc(d.title)}</h3><p class="sm mut">${esc(d.channel)} · ${'🔥'.repeat(d.level)}</p></a>
      <div class="tip"><span style="font-size:1.6rem">💡</span><div><b class="sm">আজকের টিপ</b><div>${esc(tip)}</div></div></div>
    </div>

    <h2 class="sec">${L('এখান থেকে শুরু করুন', 'Start here')}</h2>
    <div class="core">
      <a class="cc dark" href="#/arena"><span class="ci">⚡</span><h3>${L('অ্যারেনা', 'Arena')}</h3><p>${L('১০টি বাস্তব ধাঁচের পরিস্থিতিতে প্রতারকের চাপ সামলান। ভুল করলে কোচ বুঝিয়ে দেবে।', 'Handle a scammer\'s pressure in 10 realistic situations. The coach explains every mistake.')}</p><b>${L('অনুশীলন শুরু করুন', 'Start practising')} ›</b></a>
      <a class="cc" href="#/live"><span class="ci">🤖</span><h3>${L('লাইভ AI', 'Live AI')}</h3><p>${L('AI নিজে প্রতারক সাজে। যা খুশি লিখুন, প্রতিটি উত্তরের নিরাপত্তা যাচাই হবে।', 'The AI plays the scammer. Type anything and each reply is graded for safety.')}</p><b>${L('AI-এর মুখোমুখি হন', 'Face the AI')} ›</b></a>
      <a class="cc" href="#/scan"><span class="ci">🔎</span><h3>${L('স্ক্যানার', 'Scanner')}</h3><p>${L('সন্দেহজনক মেসেজ বা লিংক দিন। কী সন্দেহজনক, কী যাচাই হয়নি, এখন কী করবেন সব দেখুন।', 'Paste a suspicious message or link. See what looks wrong, what could not be checked, and what to do next.')}</p><b>${L('মেসেজ যাচাই করুন', 'Check a message')} ›</b></a>
    </div>
    <h2 class="sec">${L('আরও টুল', 'More tools')}</h2>
    <div class="tiles">
      ${T('#/voice', '🎙️', L('ভয়েস কল সিমুলেশন', 'Voice call simulator'), L('প্রতারক ফোনে কথা বলবে, আপনিও মুখে উত্তর দিন।', 'The scammer speaks on a call. Answer out loud.'), 'new')}
      ${T('#/lookalike', '🕸️', L('ভুয়া লিংক ডিটেক্টর', 'Look-alike link check'), L('bKash, ব্যাংক বা কুরিয়ারের নকল ঠিকানা অক্ষর ধরে ধরুন।', 'Catch fake bKash, bank or courier addresses letter by letter.'), 'new')}
      ${T('#/alerts', '📣', L('সাপ্তাহিক স্ক্যাম অ্যালার্ট', 'Weekly scam alert'), L('এই সপ্তাহে কোন ফাঁদ চিনে রাখবেন।', 'The trap to learn this week.'))}
      ${T('#/spot', '🎯', 'স্পট দ্য স্ক্যাম', 'আসল না নকল? ১০টি কার্ডে নিজেকে পরখ করুন।')}
      ${T('#/triage', '🩺', 'দ্রুত যাচাই', 'ছয়টি প্রশ্নে জানুন আপনি ফাঁদে পড়ছেন কি না।')}
      ${T('#/pause', '⏳', '১০ মিনিট বিরতি', 'টাকা পাঠানোর আগে থামুন, চেকলিস্টে মিলিয়ে নিন।')}
      ${T('#/audit', '🔐', 'সুরক্ষা অডিট', 'আপনার ফোন ও অ্যাকাউন্টের সুরক্ষা কতটা, স্কোর দেখুন।')}
      ${T('#/library', '📚', 'স্ক্যাম লাইব্রেরি', 'প্রচলিত ফাঁদগুলো কীভাবে কাজ করে, কীভাবে বাঁচবেন।')}
    </div>
    <h2 class="sec">পরিবার ও বিপদে</h2>
    <div class="tiles">
      ${T('#/sos', '🆘', 'SOS, প্রতারিত হয়েছি', 'প্রথম ১৫ মিনিটে কী করবেন, অভিযোগের ড্রাফটসহ।', 'sos')}
      ${T('#/shield', '🏡', 'ফ্যামিলি শিল্ড', 'কোডওয়ার্ড বানান, বড় লেখা, শেয়ার কার্ড।')}
      ${T('#/secret', '🗝️', L('সিক্রেট ওয়ার্ড প্ল্যান', 'Secret word plan'), L('ভয়েস-ক্লোন ঠেকাতে পরিবারের প্রত্যেকের জন্য গোপন শব্দ।', 'A private word for each family member against voice clones.'))}
      ${T('#/cert', '📜', 'প্রশিক্ষণ সনদ', 'আপনার স্ক্যাম আইকিউসহ সনদ ডাউনলোড করুন।')}
    </div>

    <h2 class="sec">কীভাবে কাজ করে</h2>
    <div class="grid g3 steps3">
      <div class="card"><b>অনুশীলন করুন</b><p class="sm mut">নিরাপদ জায়গায় প্রতারকের মুখোমুখি হয়ে ভুল করুন ও শিখুন। কোনো টাকা বা তথ্য ঝুঁকিতে নেই।</p></div>
      <div class="card"><b>ধরুন</b><p class="sm mut">সন্দেহজনক মেসেজ, কল বা লিংক স্ক্যান করে কোন কৌশলে ফাঁদ পাতা হয়েছে বুঝে নিন।</p></div>
      <div class="card"><b>সামলান</b><p class="sm mut">ক্ষতি হয়ে গেলে SOS গাইড ধাপে ধাপে বলে দেবে কী করতে হবে এবং অভিযোগ লিখে দেবে।</p></div>
    </div>`;
  };

  /* =========================================================
     ARENA
  ========================================================= */
  VIEWS.arena = function () {
    const d = dailyScenario();
    const cards = SG.SCENARIOS.map((s) => {
      const st = S.done[s.id]; const best = st ? st.best : 0;
      return `<a class="sc" href="#/play/${s.id}"><div class="ico">${s.icon}</div><div style="flex:1"><h3>${esc(s.title)}</h3><p class="sm mut">${esc(s.channel)}</p>
        <div class="meta"><span class="pill">${'🔥'.repeat(s.level)} ${['সহজ', 'মাঝারি', 'কঠিন'][s.level - 1]}</span><span class="pill">⚡ ${bn(s.xp)} XP</span>${s.id === d.id ? '<span class="pill warn">🗓️ আজকের চ্যালেঞ্জ</span>' : ''}${st && st.wins ? '<span class="pill ok">✔ জয় ' + bn(st.wins) + '</span>' : ''}</div></div>
        <div>${stars(best)}</div></a>`;
    }).join('');
    V.innerHTML = `<h1 style="font-size:1.8rem">⚡ অ্যারেনা</h1><p class="mut" style="margin:6px 0 16px">প্রতিটি সিমুলেশনে প্রতারক আপনাকে চাপে ফেলবে। সঠিক সিদ্ধান্ত নিন, সুরক্ষা অটুট রাখুন।</p>
      <a class="card glow" href="#/live" style="display:flex;gap:14px;align-items:center;margin-bottom:14px"><div class="ico" style="font-size:2rem">🤖</div><div style="flex:1"><b>লাইভ AI মোড</b><p class="sm mut">AI প্রতারক সম্পূর্ণ নতুন কথোপকথন তৈরি করে — যা খুশি লিখে উত্তর দিন।</p></div><span class="pill acc">নতুন</span></a>
      <div class="grid sc-grid">${cards}</div>`;
  };

  /* =========================================================
     PLAY (স্ক্রিপ্টেড সিমুলেশন)
  ========================================================= */
  VIEWS.play = function (id, tstars, from) {
    const sc = SG.SCENARIOS.find((s) => s.id === id);
    if (!sc) { location.hash = '#/arena'; return; }
    const tgt = Math.max(0, Math.min(3, parseInt(tstars, 10) || 0)), fromN = String(from || '').slice(0, 30);
    const run = { cur: null, guard: 100, hints: 0, mistakes: [], seen: {}, done: false, busy: false, steps: 0 };
    V.innerHTML = `<div class="play">
      <div class="row sp" style="margin-bottom:10px"><a class="btn sm ghost" href="#/arena">← অ্যারেনা</a><span class="pill">${sc.icon} ${esc(sc.channel)}</span></div>
      ${tgt ? `<div class="notice" style="margin-bottom:10px">🏁 চ্যালেঞ্জ: ${fromN ? esc(fromN) + ' এখানে ' : 'একজন বন্ধু '}${bn(tgt)} তারা পেয়েছেন। আপনি কি ছাড়াতে পারবেন?</div>` : ''}
      <div class="phone" id="phone">
        <div class="ph-top ${sc.ui === 'call' ? 'call' : ''}"><div class="avatar">${sc.ui === 'call' ? '📞' : '👤'}</div><div><b>${esc(sc.caller.n)}</b><small>${esc(sc.caller.s)}${sc.ui === 'call' ? ' · কল চলছে' : ''}</small></div></div>
        <div class="guard"><div class="row sp sm"><span>🛡️ আপনার সুরক্ষা</span><b id="gv">১০০%</b></div><div class="seg" id="seg"></div></div>
        <div class="chat" id="chat" role="log" aria-live="polite"></div>
        <div class="choices" id="choices"></div>
        <div class="tools"><button class="btn sm" id="hint">💡 হিন্ট</button><button class="btn sm bad" id="exit">${sc.ui === 'call' ? '📵 কল কেটে ব্লক করুন' : '🚫 ব্লক ও রিপোর্ট করুন'}</button></div>
      </div></div>`;
    const chat = $('#chat'), ch = $('#choices');
    const guardUI = () => {
      $('#gv').textContent = bn(Math.max(run.guard, 0)) + '%';
      $('#seg').innerHTML = [0, 1, 2, 3].map((i) => `<i class="${run.guard > i * 25 ? 'on' : ''} ${run.guard <= 50 ? 'low' : ''}"></i>`).join('');
    };
    const scroll = () => { chat.scrollTop = chat.scrollHeight; };
    const bubble = (cls, html) => { const d = document.createElement('div'); d.className = 'b ' + cls; d.innerHTML = html; chat.appendChild(d); scroll(); return d; };
    const typing = () => { const d = document.createElement('div'); d.className = 'typing'; d.id = 'typ'; d.innerHTML = '<i></i><i></i><i></i>'; chat.appendChild(d); scroll(); };
    const untype = () => { const t = $('#typ'); if (t) t.remove(); };

    async function showStep(step) {
      run.cur = step; run.busy = true; ch.innerHTML = '';
      typing(); await wait(sc.ui === 'call' ? 900 : 700); untype();
      if (run.done) return;
      bubble('them scam', esc(step.msg));
      step.tactics.forEach((t) => { run.seen[t] = (run.seen[t] || 0) + 1; });
      const opts = shuffle(step.choices.slice());
      ch.innerHTML = opts.map((c, i) => `<button class="ch" data-i="${i}">${esc(stripQ(c.t))}</button>`).join('');
      $$('.ch', ch).forEach((b) => b.addEventListener('click', () => pick(opts[+b.dataset.i], step)));
      run.busy = false;
    }

    function pick(c, step) {
      if (run.busy || run.done) return; run.busy = true; run.steps++;
      $$('.ch', ch).forEach((b) => (b.disabled = true));
      bubble('me', esc(stripQ(c.t)));
      step.tactics.forEach((t) => { const r = S.tac[t] || (S.tac[t] = { seen: 0, fell: 0 }); r.seen++; if (c.k !== 'safe') r.fell++; }); save();
      const lab = { safe: '✅ সঠিক চাল', risky: '⚠️ ঝুঁকিপূর্ণ চাল', fatal: '❌ ফাঁদে পড়লেন' }[c.k];
      const tc = step.tactics.map((t) => `<span class="tc">${SG.TACTICS[t].i} ${tx(SG.TACTICS[t].l)}</span>`).join(' ');
      bubble('coach ' + c.k, `<b>${lab}</b>${esc(c.fb)}<div class="chips" style="margin-top:8px">${tc}</div>`);
      if (c.k === 'risky') { run.guard -= 25; run.mistakes.push({ s: step.msg, c: c.t, fb: c.fb, k: c.k }); guardUI(); }
      if (c.k === 'fatal') { run.guard = 0; guardUI(); run.mistakes.push({ s: step.msg, c: c.t, fb: c.fb, k: c.k }); $('#phone').classList.add('shake'); }
      if (c.k === 'fatal' || run.guard <= 0) { ch.innerHTML = `<button class="btn pri" id="fin">ফলাফল দেখুন ▶</button>`; $('#fin').onclick = () => finish('lose'); return; }
      if (c.end === 'win') { ch.innerHTML = `<button class="btn pri" id="fin">ফলাফল দেখুন ▶</button>`; $('#fin').onclick = () => finish('win'); return; }
      const nx = sc.steps.find((s) => s.id === c.next) || sc.steps[sc.steps.indexOf(step) + 1];
      if (!nx) { ch.innerHTML = `<button class="btn pri" id="fin">ফলাফল দেখুন ▶</button>`; $('#fin').onclick = () => finish('win'); return; }
      ch.innerHTML = `<button class="btn pri" id="nx">পরের বার্তা ▶</button>`;
      $('#nx').onclick = () => showStep(nx);
      run.busy = false;
    }

    $('#hint').onclick = () => {
      if (!run.cur || run.done) return; run.hints++;
      bubble('sys', '💡 এই বার্তায় ব্যবহৃত কৌশল: ' + run.cur.tactics.map((t) => SG.TACTICS[t].i + ' ' + SG.TACTICS[t].l).join(', '));
    };
    $('#exit').onclick = () => { if (!run.done) finish('exit'); };

    function finish(outcome) {
      if (run.done) return; run.done = true;
      const win = outcome !== 'lose';
      let st = 0;
      if (win) st = outcome === 'exit' && run.steps === 0 ? 3 : run.guard >= 100 && run.hints === 0 ? 3 : run.guard >= 75 ? 2 : 1;
      let xp = win ? Math.round(sc.xp * (0.4 + 0.2 * st)) : 10;
      if (outcome === 'exit') xp = Math.round(xp * 0.8);
      const rec = S.done[sc.id] || { wins: 0, best: 0, plays: 0 };
      rec.plays++; S.plays++; if (win) { rec.wins++; S.wins++; rec.best = Math.max(rec.best, st); }
      S.done[sc.id] = rec;
      if (outcome === 'exit') S.exits++;
      const t = dayKey(new Date());
      let bonus = 0;
      if (win && dailyScenario().id === sc.id && S.dailyClaimed !== t) { bonus = 50; S.dailyClaimed = t; }
      save(); addXP(xp + bonus);
      if (win) award('first'); if (win && sc.ui === 'call') award('pin');
      if (S.exits >= 3) award('exit3');
      if (SG.SCENARIOS.every((s) => S.done[s.id] && S.done[s.id].wins > 0)) award('all');

      const idx = SG.SCENARIOS.indexOf(sc), next = SG.SCENARIOS[(idx + 1) % SG.SCENARIOS.length];
      const seen = Object.keys(run.seen).map((k) => `<span class="tc">${SG.TACTICS[k].i} ${tx(SG.TACTICS[k].l)} ×${bn(run.seen[k])}</span>`).join(' ');
      const mist = run.mistakes.map((m) => `<div class="mist"><b>${m.k === 'fatal' ? '❌' : '⚠️'} আপনি বলেছিলেন: ${esc(stripQ(m.c))}</b><small>${esc(m.fb)}</small></div>`).join('');
      const head = outcome === 'lose' ? ['😵', 'প্রতারক জিতে গেল!', 'চিন্তা নেই — এটা অনুশীলন। এখানে ভুল করলে কিছু হারায় না।']
        : outcome === 'exit' ? ['📵', 'সঠিক সময়ে বেরিয়ে এলেন!', run.steps === 0 ? 'আসল জীবনে এটাই সেরা চাল — প্রথম সন্দেহেই বেরিয়ে আসা।' : 'ফাঁদ বুঝে সময়মতো বেরিয়ে আসাই আসল দক্ষতা।']
          : ['🏆', 'আপনি প্রতারককে হারিয়েছেন!', 'প্রতারকের সব কৌশল আপনি কাটিয়ে উঠেছেন।'];
      V.innerHTML = `<div class="play"><div class="card result glow">
        <div class="stamp ${win ? 'ok' : 'no'}">${win ? 'ফাঁদ ধরা পড়েছে' : 'ফাঁদে পড়েছেন'}</div><div class="big-ico">${head[0]}</div><h2>${head[1]}</h2><p class="mut">${head[2]}</p>
        ${win ? stars(st) : ''}${tgt ? `<p class="sm" style="margin:6px 0">${win && st >= tgt ? '🏁 চ্যালেঞ্জ জিতেছেন!' : '🏁 চ্যালেঞ্জ বাকি: ' + bn(tgt) + ' তারা দরকার।'}</p>` : ''}<div><span class="xp">+${bn(xp + bonus)} XP</span>${bonus ? ' <span class="pill warn">🗓️ ডেইলি বোনাস +৫০</span>' : ''}</div>
        <div class="hr"></div><div class="listed"><b>📌 যা মনে রাখবেন</b><ul>${sc.lesson.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></div>
        ${seen ? `<div class="listed"><b>🎭 প্রতারক যেসব কৌশল ব্যবহার করেছে</b><div class="chips" style="margin-top:8px">${seen}</div></div>` : ''}
        ${mist ? `<div class="listed"><b>🔍 যেখানে নরম হয়েছিলেন</b>${mist}</div>` : ''}
        <div class="row" style="justify-content:center;margin-top:20px">
          <a class="btn pri" href="#/play/${sc.id}" id="again">🔁 আবার খেলুন</a>
          <a class="btn" href="#/play/${next.id}">পরের: ${next.icon} ${esc(next.title)}</a>
          <button class="btn" id="spk">🔊 শুনুন</button>
          ${win ? '<button class="btn" id="shr">📤 শেয়ার</button>' : ''}
        </div></div></div>`;
      $('#again').addEventListener('click', () => setTimeout(route, 0));
      $('#spk').onclick = () => speak(head[1] + '। ' + sc.lesson.join(' '));
      const sh = $('#shr'); if (sh) sh.onclick = () => waShare(`আমি Scam Gym-এ "${sc.title}" সিমুলেশনে প্রতারককে হারিয়েছি! ${'⭐'.repeat(st)} আমার স্কোর ছাড়াতে পারবে? ${location.origin}${location.pathname}#/play/${sc.id}/${st}/${encodeURIComponent(S.name || '')}`);
    }

    guardUI();
    bubble('sys', esc(sc.intro));
    showStep(sc.steps[0]);
  };

  /* =========================================================
     LIVE AI
  ========================================================= */
  const PERSONAS = [
    { id: 'bkash', icon: '📞', n: 'কাস্টমার কেয়ার কল', d: 'ব্যাংক/মোবাইল ব্যাংকিং সেজে OTP চায়', scen: 'bkash-otp' },
    { id: 'job', icon: '💼', n: 'চাকরির অফার', d: 'রেজিস্ট্রেশন ফি চায়', scen: 'fake-job' },
    { id: 'family', icon: '👨‍👩‍👧', n: 'আপনজন সেজে', d: 'নতুন নম্বর, জরুরি টাকা', scen: 'family-impersonation' },
    { id: 'invest', icon: '📈', n: 'ডাবল-ইনকাম বিনিয়োগ', d: 'নিশ্চিত লাভের টোপ',
      lines: ['ভাই, আমাদের প্ল্যাটফর্মে ১০,০০০ টাকা দিলে ৭ দিনে ২০,০০০ টাকা নিশ্চিত! শত শত মানুষ লাভ পাচ্ছে, দেখুন স্ক্রিনশট।', 'প্রথমে ৫০০ টাকা দিয়ে ট্রায়াল করুন, আজই দ্বিগুণ ফেরত পাবেন। সুযোগ শুধু আজকের জন্য!', 'দেখলেন তো লাভ এসেছে! এবার ২০,০০০ টাকা দিন, ৪০,০০০ হবে। অফার আর ১ ঘণ্টা।', 'টাকা তুলতে হলে ১০% চার্জ আগে দিতে হবে, না দিলে অ্যাকাউন্ট ফ্রিজ হবে!'] },
    { id: 'authority', icon: '🚨', n: 'পুলিশ / সিম বন্ধের হুমকি', d: 'ভয় দেখিয়ে তথ্য চায়', scen: 'fake-authority' }
  ];

  VIEWS.live = async function (pid) {
    if (!pid) {
      const ok = await aiStatus();
      V.innerHTML = `<div class="play"><h1 style="font-size:1.8rem">🤖 লাইভ AI মোড</h1>
        <p class="mut" style="margin:6px 0 14px">এখানে AI নিজে প্রতারক সাজে। আপনি যা খুশি লিখুন — সত্যিকারের কথোপকথনে কীভাবে টিকে থাকবেন, অনুশীলন করুন।</p>
        <div class="notice" style="margin-bottom:14px">${ok ? '🟢 AI ইঞ্জিন চালু আছে।' : '🟡 AI সংযোগ নেই — অফলাইন ইঞ্জিনে চলবে (কম নমনীয়, কিন্তু কাজ করবে)।'} সব চরিত্র ও নম্বর কাল্পনিক।</div>
        <div class="stack">${PERSONAS.map((p) => `<a class="sc" href="#/live/${p.id}"><div class="ico">${p.icon}</div><div><h3>${esc(p.n)}</h3><p class="sm mut">${esc(p.d)}</p></div></a>`).join('')}</div></div>`;
      return;
    }
    const p = PERSONAS.find((x) => x.id === pid); if (!p) { location.hash = '#/live'; return; }
    const scen = p.scen ? SG.SCENARIOS.find((s) => s.id === p.scen) : null;
    const lines = p.lines || scen.steps.map((s) => s.msg);
    let ai = await aiStatus(); const hist = []; let guard = 100, safeN = 0, turns = 0, over = false, li = 0, busy = false;
    if (window.location.hash.indexOf('#/live/' + pid) !== 0) return; // রাউট বদলে গেছে
    V.innerHTML = `<div class="play">
      <div class="row sp" style="margin-bottom:10px"><a class="btn sm ghost" href="#/live">← বদলান</a><span class="pill ${ai ? 'ok' : 'warn'}" id="aip">${ai ? '🟢 AI চালু' : '🟡 অফলাইন ইঞ্জিন'}</span></div>
      <div class="phone"><div class="ph-top ${scen && scen.ui === 'call' ? 'call' : ''}"><div class="avatar">${p.icon}</div><div><b>${esc(p.n)}</b><small>AI-চালিত সিমুলেশন · সব কাল্পনিক</small></div></div>
      <div class="guard"><div class="row sp sm"><span>🛡️ আপনার সুরক্ষা</span><b id="gv">১০০%</b></div><div class="seg" id="seg"></div></div>
      <div class="chat" id="chat" role="log" aria-live="polite"></div>
      <form class="inp" id="f"><input id="t" autocomplete="off" placeholder="আপনার উত্তর লিখুন…" maxlength="300" aria-label="আপনার উত্তর"><button class="btn pri" id="sendb" type="submit">পাঠান</button></form>
      <div class="tools" style="padding-top:12px"><button class="btn sm bad" id="exit">${p.id === 'bkash' || p.id === 'authority' ? '📵 কল কেটে ব্লক করুন' : '🚫 ব্লক ও রিপোর্ট করুন'}</button><button class="btn sm" id="quit">শেষ করুন</button></div></div></div>`;
    const chat = $('#chat'), inp = $('#t'), form = $('#f');
    const guardUI = () => { $('#gv').textContent = bn(Math.max(guard, 0)) + '%'; $('#seg').innerHTML = [0, 1, 2, 3].map((i) => `<i class="${guard > i * 25 ? 'on' : ''} ${guard <= 50 ? 'low' : ''}"></i>`).join(''); };
    const bubble = (cls, html) => { const d = document.createElement('div'); d.className = 'b ' + cls; d.innerHTML = html; chat.appendChild(d); chat.scrollTop = chat.scrollHeight; return d; };
    const typing = (on) => { const t = $('#typ'); if (t) t.remove(); if (on) { const d = document.createElement('div'); d.className = 'typing'; d.id = 'typ'; d.innerHTML = '<i></i><i></i><i></i>'; chat.appendChild(d); chat.scrollTop = chat.scrollHeight; } };
    const setBusy = (b) => { busy = b; inp.disabled = b; $('#sendb').disabled = b; };

    const coachTxt = { safe: '✅ ভালো চাল! আপনি যাচাই/প্রত্যাখ্যানের পথে আছেন।', risky: '⚠️ আলাপ চালিয়ে গেলে প্রতারক আরও চাপ দেবে। প্রত্যাখ্যান করুন ও নিজে যাচাই করুন।', fatal: '❌ তথ্য বা টাকা দিয়ে ফেলেছেন — আসল জীবনে এটাই ক্ষতির মুহূর্ত।' };
    function localTurn(userText) {
      const danger = SC.judgeReply(userText);
      const msg = lines[Math.min(li, lines.length - 1)]; li++;
      return { scammer: danger === 'safe' && li > lines.length ? 'ঠিক আছে, তাহলে থাক…' : msg, coach: coachTxt[danger], danger };
    }
    async function opening() {
      setBusy(true); typing(true); await wait(700);
      let first = lines[0]; li = 1;
      if (ai) { try { const r = await aiCall('/api/chat', { persona: pid, history: [] }); if (r && r.scammer) first = r.scammer; } catch (e) { ai = false; $('#aip').className = 'pill warn'; $('#aip').textContent = '🟡 অফলাইন ইঞ্জিন'; } }
      typing(false); bubble('them scam', esc(first)); hist.push({ role: 'scammer', text: first }); setBusy(false); inp.focus();
    }
    async function turn(text) {
      if (over || busy) return; setBusy(true); turns++;
      bubble('me', esc(text)); hist.push({ role: 'user', text }); typing(true);
      let res = null;
      if (ai) {
        try { res = await aiCall('/api/chat', { persona: pid, history: hist.slice(-16) }); }
        catch (e) { ai = false; $('#aip').className = 'pill warn'; $('#aip').textContent = '🟡 অফলাইন ইঞ্জিন'; toast('AI সংযোগ হয়নি — অফলাইন ইঞ্জিনে চলছে', true); }
      }
      if (!res || !res.scammer) res = localTurn(text);
      await wait(600); typing(false);
      const d = ['safe', 'risky', 'fatal'].includes(res.danger) ? res.danger : 'risky';
      bubble('them scam', esc(res.scammer)); hist.push({ role: 'scammer', text: res.scammer });
      bubble('coach ' + d, `<b>${{ safe: '✅ সঠিক', risky: '⚠️ ঝুঁকিপূর্ণ', fatal: '❌ ফাঁদে পড়লেন' }[d]}</b>${esc(res.coach || coachTxt[d])}`);
      if (d === 'safe') safeN++;
      if (d === 'risky') { guard -= 25; guardUI(); }
      if (d === 'fatal') { guard = 0; guardUI(); }
      if (guard <= 0) return end('lose');
      if (safeN >= 3 || turns >= 10) return end('win');
      setBusy(false); inp.focus();
    }
    function end(outcome) {
      if (over) return; over = true; setBusy(true);
      const win = outcome !== 'lose';
      const xp = win ? (outcome === 'exit' ? 80 : 60 + Math.max(0, Math.round(guard / 4))) : 10;
      S.plays++; if (win) { S.wins++; award('first'); } if (outcome === 'exit') { S.exits++; if (S.exits >= 3) award('exit3'); } save(); addXP(xp);
      const box = document.createElement('div'); box.className = 'card result glow'; box.style.margin = '14px';
      box.innerHTML = `<div class="stamp ${win ? 'ok' : 'no'}">${win ? 'ফাঁদ ধরা পড়েছে' : 'ফাঁদে পড়েছেন'}</div><div class="big-ico">${win ? '🏆' : '😵'}</div><h2>${win ? 'আপনি টিকে গেছেন!' : 'প্রতারক জিতে গেল'}</h2><p class="mut">${win ? 'চাপের মধ্যেও আপনি তথ্য বা টাকা দেননি।' : 'এখানে ভুল করলে ক্ষতি নেই — এটাই অনুশীলনের জায়গা।'}</p><div><span class="xp">+${bn(xp)} XP</span></div>
        <div class="row" style="justify-content:center;margin-top:16px"><a class="btn pri" href="#/live/${pid}" id="again2">🔁 আবার</a><a class="btn" href="#/live">অন্য চরিত্র</a><a class="btn" href="#/scan">🔎 স্ক্যান করুন</a></div>`;
      chat.appendChild(box); chat.scrollTop = chat.scrollHeight;
      const ag = $('#again2'); if (ag) ag.addEventListener('click', () => setTimeout(route, 0));
    }
    form.addEventListener('submit', (e) => { e.preventDefault(); const v = inp.value.trim(); if (!v) return; inp.value = ''; turn(v); });
    $('#exit').onclick = () => { if (!over) { bubble('sys', '📵 আপনি সংযোগ বিচ্ছিন্ন করে ব্লক করেছেন।'); end('exit'); } };
    $('#quit').onclick = () => { location.hash = '#/live'; };
    guardUI(); await opening();
  };

  /* =========================================================
     SCAN
  ========================================================= */
  VIEWS.scan = function () {
    V.innerHTML = `<h1 style="font-size:1.8rem">🔎 স্ক্যাম স্ক্যানার</h1>
      <p class="mut" style="margin:6px 0 14px">সন্দেহজনক মেসেজ, কলের কথা বা লিংক পেস্ট করুন। কোন কৌশলে ফাঁদ পাতা হয়েছে আমরা ধরিয়ে দেব।</p>
      <div class="card">
        <div class="chips" style="margin-bottom:10px">${(LANG === 'en' && SG.SAMPLES_EN ? SG.SAMPLES_EN : SG.SAMPLES).map((s, i) => `<button class="btn sm" data-s="${i}">${esc(s.n)}</button>`).join('')}</div>
        <textarea class="field" id="txt" placeholder="এখানে মেসেজ বা লিংক পেস্ট করুন…" maxlength="5000" aria-label="যাচাইয়ের লেখা"></textarea>
        <div class="row" style="margin-top:12px"><button class="btn pri" id="go">🔎 বিশ্লেষণ করুন</button><button class="btn ghost" id="clr">মুছুন</button><label class="btn" for="img" id="imgl">📷 স্ক্রিনশট (AI)</label><input type="file" id="img" accept="image/*" hidden></div>
        <p class="sm mut" style="margin-top:10px">🔒 বিশ্লেষণ আপনার ডিভাইসেই হয়। "AI গভীর বিশ্লেষণ" বা স্ক্রিনশট বেছে নিলেই শুধু টেক্সট/ছবি AI সার্ভারে যায়।</p>
      </div><div id="out" style="margin-top:16px"></div>`;
    const out = $('#out'), txt = $('#txt');
    try { const pf = sessionStorage.getItem('sg.prefill'); if (pf) { sessionStorage.removeItem('sg.prefill'); txt.value = pf; setTimeout(() => $('#go') && $('#go').click(), 0); } } catch (e) { /* ignore */ }
    $$('[data-s]').forEach((b) => b.addEventListener('click', () => { txt.value = (LANG === 'en' && SG.SAMPLES_EN ? SG.SAMPLES_EN : SG.SAMPLES)[+b.dataset.s].t; analyze(); }));
    $('#clr').onclick = () => { txt.value = ''; out.innerHTML = ''; };
    $('#go').onclick = analyze;

    function gauge(score, key) {
      const col = { low: '#1f7a55', mid: '#c98a1b', high: '#d0601f', critical: '#b3173e' }[key];
      const C = 2 * Math.PI * 70, off = C - (score / 100) * C;
      return `<div class="gauge"><div class="rs" aria-hidden="true">${rosette({ n: 30, rx: 48, ry: 14, sw: 0.4 })}</div><svg viewBox="0 0 160 160"><circle cx="80" cy="80" r="70" fill="none" stroke="rgba(13,43,44,.12)" stroke-width="14"/><circle cx="80" cy="80" r="70" fill="none" stroke="${col}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${off}" style="transition:stroke-dashoffset .9s"/></svg><div class="v"><div><b style="color:${col}">${bn(score)}</b><span><br>ঝুঁকির স্কোর</span></div></div></div>`;
    }
    function unverified(r, text) {
      const u = [L('বার্তাটি সত্যিই ওই প্রতিষ্ঠান থেকে এসেছে কি না (প্রেরকের পরিচয় আমরা দেখতে পারি না)।', 'Whether the message really came from that organisation (we cannot see the sender).')];
      if (r.links.length) u.push(L('লিংকের ভেতরের পেজ আমরা খুলি না। পেজটা দেখতে কেমন বা কী চায়, তা যাচাই হয়নি।', 'We never open the link, so what the page looks like or asks for is unchecked.'));
      if (/01[3-9][\d\s-]{8,}/.test(text)) u.push(L('নম্বরটির আসল মালিক কে, তা জানা যায়নি।', 'Who actually owns the phone number is unknown.'));
      if (/(টাকা|tk|taka|৳|bkash|বিকাশ|নগদ|nagad)/i.test(text)) u.push(L('টাকার অঙ্ক বা লেনদেনের দাবি সত্যি কি না আপনার নিজের অ্যাপে মিলিয়ে দেখুন।', 'Check any money claim against your own app or statement.'));
      if (r.score < 15) u.push(L('কোনো লাল পতাকা না পাওয়া মানে নিরাপদ প্রমাণ নয়।', 'Finding no red flags does not prove the message is safe.'));
      return u;
    }
    function analyze() {
      const text = txt.value.trim();
      if (!text) { toast('আগে কিছু লিখুন বা পেস্ট করুন', true); return; }
      const r = SC.analyze(text);
      S.scans++; save(); if (S.scans >= 5) award('scan5');
      const tc = Object.keys(r.tactics).map((k) => `<span class="tc">${SG.TACTICS[k].i} ${tx(SG.TACTICS[k].l)}</span>`).join(' ');
      out.innerHTML = `<div class="card glow c stack"><div>${gauge(r.score, r.key)}</div><h2>${r.emoji} ${esc(r.level)}</h2>
        ${r.notes.length ? `<div class="notice" style="text-align:left">${r.notes.map(esc).join('<br>')}</div>` : ''}
        ${tc ? `<div class="chips" style="justify-content:center">${tc}</div>` : ''}
        <div class="row" style="justify-content:center"><button class="btn sm" id="spk">🔊 ফলাফল শুনুন</button><button class="btn sm" id="shr">📤 পরিবারকে সতর্ক করুন</button></div></div>
      <h2 class="sec">🖍️ চিহ্নিত অংশ</h2><div class="hl">${SC.highlight(r.text, r.ranges, esc)}</div>
      ${r.rules.length ? `<h2 class="sec">🚩 লাল পতাকা <small>(${bn(r.rules.length)}টি)</small></h2><div class="card">${r.rules.map((x) => `<div class="flagrow"><div class="w">+${bn(x.w)}</div><div><b>${SG.TACTICS[x.tactic].i} ${esc(x.label)}</b><div class="sm mut">${esc(x.why)}</div></div></div>`).join('')}${r.bonus.map((b) => `<div class="flagrow"><div class="w">⚠️</div><div class="sm">${esc(b)}</div></div>`).join('')}</div>` : ''}
      ${r.links.length ? `<h2 class="sec">🔗 লিংক বিশ্লেষণ</h2><div class="card">${r.links.map((l) => `<div class="lk ${l.official ? 'official' : l.risk >= 30 ? 'bad' : ''}"><b>${esc(l.host)}</b> ${l.official ? '<span class="pill ok">অফিসিয়াল তালিকায় আছে</span>' : l.risk >= 30 ? '<span class="pill bad">উচ্চ ঝুঁকি</span>' : '<span class="pill warn">যাচাই করুন</span>'}${l.flags.map((f) => `<div class="sm mut">• ${esc(f.t)}</div>`).join('')}${l.official ? '<div class="sm mut">অফিসিয়াল তালিকায় থাকা মানেই ১০০% নিরাপদ নয় — পুরো ঠিকানা ভালো করে দেখুন।</div>' : ''}</div>`).join('')}</div>` : ''}
      <h2 class="sec">${L('❓ যা যাচাই করা যায়নি', '❓ What could not be checked')}</h2><div class="card"><ul class="ul">${unverified(r, text).map((x) => `<li>${esc(x)}</li>`).join('')}</ul><p class="sm mut" style="margin-top:8px">${L('স্ক্যানার শুধু লেখাটা দেখে। এই বিষয়গুলো আপনাকে নিজে অফিসিয়াল মাধ্যমে যাচাই করতে হবে।', 'The scanner only reads the text. You have to verify these yourself through official channels.')}</p></div>
      <h2 class="sec">🛡️ এখন কী করবেন</h2><div class="card"><ul class="ul">${r.advice.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>
      <div class="card ai-box" style="margin-top:16px"><div class="row sp"><div><b>🧠 AI গভীর বিশ্লেষণ</b><div class="sm mut">প্রসঙ্গ বুঝে দ্বিতীয় মতামত — নিয়ম-ভিত্তিক ইঞ্জিনের পরিপূরক।</div></div><button class="btn sm" id="ai">বিশ্লেষণ করুন</button></div><div id="aiout"></div></div>`;
      $('#spk').onclick = () => speak(r.level + '। ঝুঁকির স্কোর ' + bn(r.score) + '। ' + r.advice.slice(0, 3).join(' '));
      $('#shr').onclick = () => waShare('⚠️ সতর্কতা! এই ধরনের মেসেজ প্রতারণার ফাঁদ হতে পারে। Scam Gym-এ যাচাই করে দেখুন: ' + location.origin);
      $('#ai').onclick = () => deep({ text });
      out.scrollIntoView({ behavior: FAST ? 'auto' : 'smooth', block: 'start' });
    }
    const VERD = { safe_likely: '🟢 নিরাপদ হওয়ার সম্ভাবনা বেশি', suspicious: '🟠 সন্দেহজনক', high_risk: '🔴 উচ্চ ঝুঁকি', scam: '🔴 প্রায় নিশ্চিত স্ক্যাম', unclear: '⚪ নিশ্চিত করে বলা যাচ্ছে না' };
    async function deep(payload) {
      let box = $('#aiout'); if (!box) { out.innerHTML = '<div class="card ai-box"><div id="aiout"></div></div>'; box = $('#aiout'); }
      box.innerHTML = '<p class="sm" style="margin-top:12px"><span class="spin"></span> AI বিশ্লেষণ করছে…</p>';
      try {
        const j = await aiCall('/api/analyze', payload);
        const li = (a) => (a && a.length ? `<ul class="ul">${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '');
        box.innerHTML = `<div style="margin-top:12px"><h3>${VERD[j.verdict] || VERD.unclear} ${j.score != null ? '· স্কোর ' + bn(j.score) : ''}</h3><p style="margin:8px 0">${esc(j.summary || '')}</p>
          ${j.red_flags && j.red_flags.length ? '<div class="tag-h">🚩 লাল পতাকা</div>' + li(j.red_flags) : ''}${j.what_to_do && j.what_to_do.length ? '<div class="tag-h">🛡️ করণীয়</div>' + li(j.what_to_do) : ''}
          ${j.safe_reply ? `<div class="tag-h">💬 নিরাপদ উত্তরের খসড়া</div><div class="out-t">${esc(j.safe_reply)}</div>` : ''}
          <p class="sm mut" style="margin-top:10px">⚠️ AI ভুল করতে পারে। এটি নিশ্চয়তা নয় — গুরুত্বপূর্ণ সিদ্ধান্তে নিজে অফিসিয়াল চ্যানেলে যাচাই করুন।</p></div>`;
      } catch (e) {
        box.innerHTML = `<div class="notice" style="margin-top:12px">${e.status === 503 || e.status === 404 || !e.status ? 'AI সংযোগ এখন চালু নেই। ওপরের নিয়ম-ভিত্তিক বিশ্লেষণটি দেখুন।' : 'AI উত্তর দিতে পারেনি: ' + esc(e.message)}</div>`;
      }
    }
    function toJpeg(file, max = 1280) {
      return new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)); const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.82).split(',')[1]); }; im.onerror = rej; im.src = fr.result; };
        fr.onerror = rej; fr.readAsDataURL(file);
      });
    }
    $('#img').addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      if (!(await aiStatus())) { out.innerHTML = '<div class="notice">স্ক্রিনশট বিশ্লেষণে AI লাগে, যা এখন চালু নেই। মেসেজের লেখা পেস্ট করলে অফলাইনেই স্ক্যান হবে।</div>'; return; }
      try { out.innerHTML = '<div class="card ai-box"><div id="aiout"></div></div>'; const data = await toJpeg(f); await deep({ text: txt.value.trim(), image: { mime: 'image/jpeg', data } }); }
      catch (err) { toast('ছবি পড়া যায়নি', true); }
    });
  };

  /* =========================================================
     SPOT
  ========================================================= */
  VIEWS.spot = function () {
    const pool = shuffle(SG.SPOT.slice()).slice(0, 10); let i = 0, score = 0, locked = false, streak = 0;
    function render() {
      if (i >= pool.length) return end();
      const c = pool[i];
      V.innerHTML = `<div class="spot"><div class="row sp" style="margin-bottom:12px"><a class="btn sm ghost" href="#/home">← হোম</a><span class="pill">কার্ড ${bn(i + 1)}/${bn(pool.length)}</span><span class="pill ok">✔ ${bn(score)}</span></div>
        <div class="bar" style="margin-bottom:14px"><i style="width:${(i / pool.length) * 100}%"></i></div>
        <div class="sms" id="card"><div class="fr"><div class="avatar">${{ sms: '💬', call: '📞', chat: '👤', post: '📢' }[c.k]}</div><div><b>${esc(c.from)}</b><div class="sm mut">${{ sms: 'এসএমএস', call: 'ফোন কল', chat: 'চ্যাট', post: 'পোস্ট' }[c.k]}</div></div></div><div class="tx">${esc(c.text)}</div></div>
        <p class="c sm mut" style="margin-top:10px">← সোয়াইপ: স্ক্যাম · আসল: সোয়াইপ →</p>
        <div class="ans"><button class="btn bad" id="bs">🚨 স্ক্যাম</button><button class="btn pri" id="br">✅ আসল</button></div><div id="fb"></div></div>`;
      locked = false;
      $('#bs').onclick = () => answer('scam'); $('#br').onclick = () => answer('real');
      const card = $('#card'); let x0 = null;
      card.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      card.addEventListener('touchend', (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (dx < -70) answer('scam'); else if (dx > 70) answer('real'); });
    }
    function answer(a) {
      if (locked) return; locked = true; const c = pool[i], ok = a === c.a;
      if (ok) { score++; streak++; } else streak = 0;
      const card = $('#card'); if (card) card.classList.add(a === 'scam' ? 'out-l' : 'out-r');
      setTimeout(() => { if (card) { card.classList.remove('out-l', 'out-r'); } }, FAST ? 0 : 320);
      $('#fb').innerHTML = `<div class="fbk ${ok ? 'ok' : 'no'}"><b>${ok ? '✅ ঠিক ধরেছেন!' : '❌ ভুল হলো'} — এটি ${c.a === 'scam' ? 'স্ক্যাম 🚨' : 'আসল ✅'}</b><p style="margin:6px 0 0">${esc(c.why)}</p></div><div class="row" style="justify-content:center;margin-top:12px"><button class="btn pri" id="nx">${i + 1 >= pool.length ? 'ফলাফল' : 'পরের কার্ড'} ▶</button></div>`;
      $('#bs').disabled = true; $('#br').disabled = true;
      $('#nx').onclick = () => { i++; render(); };
    }
    function end() {
      const xp = score * 8 + (score === 10 ? 20 : 0); S.spotBest = Math.max(S.spotBest, score); save(); addXP(xp); if (score === 10) award('spot10');
      const msg = score === 10 ? 'নিখুঁত! আপনার চোখ প্রতারকের সব ফাঁদ ধরে ফেলে।' : score >= 7 ? 'চমৎকার! সামান্য কিছু ফাঁক আছে।' : 'আরেকবার চেষ্টা করুন — প্রতারকরা প্রতিদিন কৌশল বদলায়।';
      V.innerHTML = `<div class="spot"><div class="card result glow"><div class="big-ico">${score >= 7 ? '🎯' : '🤔'}</div><h2>${bn(score)}/${bn(pool.length)}</h2><p class="mut">${msg}</p><div><span class="xp">+${bn(xp)} XP</span></div><div class="row" style="justify-content:center;margin-top:18px"><a class="btn pri" href="#/spot" id="ag">🔁 আবার</a><a class="btn" href="#/library">📚 লাইব্রেরি</a></div></div></div>`;
      $('#ag').addEventListener('click', () => setTimeout(route, 0));
    }
    const key = (e) => { if (e.key === 'ArrowLeft') answer('scam'); if (e.key === 'ArrowRight') answer('real'); };
    document.addEventListener('keydown', key); cleanup = () => document.removeEventListener('keydown', key);
    render();
  };

  /* =========================================================
     LIBRARY
  ========================================================= */
  VIEWS.library = function () {
    const rc = (r) => (r.includes('অতি') ? 'bad' : r.includes('উচ্চ') ? 'warn' : '');
    V.innerHTML = `<h1 style="font-size:1.8rem">📚 স্ক্যাম লাইব্রেরি</h1><p class="mut" style="margin:6px 0 14px">বাংলাদেশে প্রচলিত ফাঁদগুলো কীভাবে কাজ করে এবং কীভাবে বাঁচবেন।</p>
      <input class="field" id="q" placeholder="🔍 খুঁজুন (যেমন: OTP, চাকরি, লিংক)…" aria-label="খুঁজুন" style="margin-bottom:14px">
      <div class="stack" id="lst"></div>`;
    const lst = $('#lst');
    function draw(q) {
      const k = (q || '').trim().toLowerCase();
      const items = SG.LIBRARY.filter((x) => !k || (x.name + x.how + x.flags.join(' ')).toLowerCase().includes(k));
      lst.innerHTML = items.length ? items.map((x) => `<details class="acc"><summary><span style="font-size:1.5rem">${x.icon}</span><span style="flex:1">${esc(x.name)}</span><span class="pill ${rc(x.risk)}">${esc(x.risk)}</span></summary><div class="bd"><p>${esc(x.how)}</p>
        <div class="tag-h">🚩 লাল পতাকা</div><ul class="ul">${x.flags.map((f) => `<li>${esc(f)}</li>`).join('')}</ul><div class="tag-h">🛡️ কী করবেন</div><ul class="ul">${x.todo.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div></details>`).join('') : '<div class="card c mut">কিছু পাওয়া যায়নি।</div>';
    }
    $('#q').addEventListener('input', (e) => draw(e.target.value)); draw('');
  };

  /* =========================================================
     SOS
  ========================================================= */
  VIEWS.sos = function () {
    award('sos');
    const first = [
      ['যোগাযোগ বন্ধ করুন — কিন্তু আগে স্ক্রিনশট নিন', 'প্রতারকের নম্বর, মেসেজ, ট্রানজেকশন আইডি ও পেমেন্টের স্ক্রিনশট সংরক্ষণ করুন। তারপর কথা বন্ধ করুন।'],
      ['ব্যাংক/মোবাইল ব্যাংকিং হেল্পলাইনে এখনই ফোন করুন', 'লেনদেন আটকানো বা অ্যাকাউন্ট/কার্ড ব্লক করার অনুরোধ জানান। যত দ্রুত, তত বেশি সুযোগ।'],
      ['পিন ও পাসওয়ার্ড বদলান', 'মোবাইল ব্যাংকিং, ইমেইল, ফেসবুক ও অন্যান্য অ্যাকাউন্টের পাসওয়ার্ড বদলান। টু-স্টেপ ভেরিফিকেশন চালু করুন।'],
      ['রিমোট অ্যাপ থাকলে মুছুন, ইন্টারনেট বন্ধ করুন', 'AnyDesk/TeamViewer বা অচেনা APK আনইনস্টল করুন। প্রয়োজনে ফোন ফ্লাইট মোডে রাখুন।'],
      ['লেনদেনের তথ্য লিখে রাখুন', 'তারিখ-সময়, পরিমাণ, প্রাপকের নম্বর/অ্যাকাউন্ট, ট্রানজেকশন আইডি — অভিযোগে লাগবে।'],
      ['বিশ্বস্ত কাউকে জানান', 'পরিবারের সদস্য বা বন্ধুকে বলুন। লজ্জা পাবেন না — এটা আপনার দোষ নয়।']
    ];
    V.innerHTML = `<div class="stack">
      <div class="sos-hero"><div style="font-size:2.6rem">🆘</div><h1>আমি প্রতারিত হয়েছি</h1><p class="mut" style="margin:8px 0 14px">শান্ত থাকুন। নিচের ধাপগুলো এক এক করে করুন — প্রথম ১৫ মিনিট সবচেয়ে গুরুত্বপূর্ণ।</p>
        <a class="btn bad pulse" href="tel:999">📞 জরুরি সেবা ৯৯৯ (হুমকি/ব্ল্যাকমেইল হলে)</a></div>
      <div class="card"><h2 class="sec" style="margin-top:0">⏱️ প্রথম ১৫ মিনিট</h2>${first.map((s, i) => `<label class="chk"><input type="checkbox" aria-label="ধাপ ${i + 1}"><div><b>${bn(i + 1)}. ${esc(s[0])}</b><div class="sm mut">${esc(s[1])}</div></div></label>`).join('')}</div>
      <div class="card"><h2 class="sec" style="margin-top:0">📞 হেল্পলাইন</h2><div class="stack">${SG.HELPLINES.map((h) => `<a class="hl-l" href="tel:${h.tel}"><b>${h.n}</b><span class="sm">${esc(h.d)}</span></a>`).join('')}</div><p class="sm mut" style="margin-top:10px">⚠️ নম্বরগুলো ব্যবহারের আগে অফিসিয়াল ওয়েবসাইট বা কার্ড থেকে মিলিয়ে নিন। ব্যাংকের নিজস্ব হটলাইন কার্ডের পেছনে লেখা থাকে।</p></div>
      <div class="card"><h2 class="sec" style="margin-top:0">📝 অভিযোগের ড্রাফট তৈরি করুন</h2>
        <label class="l">কার কাছে অভিযোগ</label><select class="field" id="to"><option value="thana">থানা (সাধারণ ডায়েরি / অভিযোগ)</option><option value="mfs">মোবাইল ব্যাংকিং সেবাদাতা</option><option value="bank">ব্যাংক</option></select>
        <div class="grid g2"><div><label class="l">আপনার নাম</label><input class="field" id="nm"></div><div><label class="l">আপনার মোবাইল</label><input class="field" id="ph" inputmode="tel"></div>
        <div><label class="l">ঘটনার তারিখ ও সময়</label><input class="field" id="dt" placeholder="যেমন: ১২ নভেম্বর, রাত ৯টা"></div><div><label class="l">হারানো টাকা (৳)</label><input class="field" id="am" inputmode="numeric"></div>
        <div><label class="l">মাধ্যম</label><select class="field" id="md"><option>বিকাশ</option><option>নগদ</option><option>রকেট</option><option>উপায়</option><option>ব্যাংক ট্রান্সফার</option><option>কার্ড</option><option>অন্যান্য</option></select></div><div><label class="l">প্রতারকের নম্বর/অ্যাকাউন্ট</label><input class="field" id="sc"></div></div>
        <label class="l">ট্রানজেকশন আইডি (থাকলে)</label><input class="field" id="tx"><label class="l">কীভাবে ঘটল (সংক্ষেপে)</label><textarea class="field" id="ds" style="min-height:100px" placeholder="যেমন: কাস্টমার কেয়ার পরিচয়ে একজন ফোন করে OTP চাইল…"></textarea>
        <div class="row" style="margin-top:12px"><button class="btn pri" id="mk">✍️ ড্রাফট তৈরি করুন</button></div><div id="dout" style="margin-top:14px"></div>
        <p class="sm mut" style="margin-top:8px">এটি আইনি পরামর্শ নয়। প্রয়োজনে থানা বা আইনজীবীর সঙ্গে পরামর্শ করুন।</p></div>
      <div class="card"><h2 class="sec" style="margin-top:0">📅 পরবর্তী ২৪ ঘণ্টা</h2><ul class="ul"><li>থানায় অভিযোগ/জিডি করুন; অপারেটর বা ব্যাংকে লিখিত অভিযোগ দিন।</li><li>NID বা কাগজপত্র ফাঁস হলে নতুন সিম/অ্যাকাউন্ট খোলা হচ্ছে কি না নজরে রাখুন এবং অপারেটর/ব্যাংককে জানান।</li><li>টাকা ফেরত পাওয়ার নিশ্চয়তা নেই, তবে দ্রুত জানালে সুযোগ বাড়ে।</li><li>একই প্রতারক আবার ফোন করতে পারে — "টাকা ফেরত দেব" বলে আরেকটি ফাঁদও আসে। সাবধান থাকুন।</li></ul></div>
      <div class="notice">💚 প্রতারণার শিকার হওয়া কোনো লজ্জার বিষয় নয় — খুব সতর্ক মানুষও পড়ে। দ্রুত পদক্ষেপই আসল।</div></div>`;
    $('#mk').onclick = () => {
      const g = (id) => ($('#' + id).value || '').trim() || '………';
      const to = $('#to').value;
      const addr = { thana: 'বরাবর,\nভারপ্রাপ্ত কর্মকর্তা (অফিসার ইনচার্জ)\n………… থানা', mfs: 'বরাবর,\nগ্রাহক সেবা বিভাগ\n' + g('md') + ' কর্তৃপক্ষ', bank: 'বরাবর,\nশাখা ব্যবস্থাপক\n………… ব্যাংক, ………… শাখা' }[to];
      const ask = { thana: 'বিষয়টি তদন্ত করে প্রতারকের বিরুদ্ধে আইনি ব্যবস্থা গ্রহণ এবং আমার অর্থ উদ্ধারে সহযোগিতা করার জন্য বিনীত অনুরোধ জানাচ্ছি।', mfs: 'উল্লিখিত লেনদেনটি জরুরি ভিত্তিতে যাচাই করে স্থগিত/আটকানো এবং প্রাপকের অ্যাকাউন্টের বিরুদ্ধে ব্যবস্থা নেওয়ার অনুরোধ জানাচ্ছি।', bank: 'উল্লিখিত লেনদেনটি জরুরি ভিত্তিতে যাচাই করে স্থগিত করা এবং আমার অ্যাকাউন্ট/কার্ড সুরক্ষিত রাখার ব্যবস্থা নেওয়ার অনুরোধ জানাচ্ছি।' }[to];
      const t = `${addr}\n\nবিষয়: মোবাইল/অনলাইন প্রতারণার মাধ্যমে অর্থ আত্মসাতের অভিযোগ।\n\nজনাব/জনাবা,\nআমি ${g('nm')}, মোবাইল: ${g('ph')}। গত ${g('dt')} একজন অজ্ঞাত ব্যক্তি/চক্র প্রতারণামূলক উপায়ে আমার কাছ থেকে ${g('am')} টাকা হাতিয়ে নেয়।\n\nঘটনার সংক্ষিপ্ত বিবরণ:\n${g('ds')}\n\nলেনদেনের তথ্য:\n• মাধ্যম: ${g('md')}\n• প্রতারকের নম্বর/অ্যাকাউন্ট: ${g('sc')}\n• ট্রানজেকশন আইডি: ${g('tx')}\n\n${ask}\n\nআমার কাছে সংশ্লিষ্ট স্ক্রিনশট ও লেনদেনের প্রমাণ সংরক্ষিত আছে।\n\nবিনীত,\n${g('nm')}\nমোবাইল: ${g('ph')}\nতারিখ: ………`;
      $('#dout').innerHTML = `<div class="out-t" id="otxt">${esc(t)}</div><div class="row" style="margin-top:10px"><button class="btn" id="cp">📋 কপি করুন</button><button class="btn" id="pr">🖨️ প্রিন্ট</button></div>`;
      $('#cp').onclick = () => copy(t); $('#pr').onclick = () => window.print();
    };
  };

  /* =========================================================
     FAMILY SHIELD
  ========================================================= */
  VIEWS.shield = function () {
    const rules = SG.GOLDEN_RULES.map((r) => `<div class="rule"><i>${r[0]}</i><div><b>${esc(r[1])}</b><div class="sm mut">${esc(r[2])}</div></div></div>`).join('');
    V.innerHTML = `<div class="stack"><h1 style="font-size:1.8rem">🏡 ফ্যামিলি শিল্ড</h1><p class="mut">প্রতারকরা প্রায়ই বাবা-মা ও বয়স্কদের লক্ষ্য করে। পরিবারের জন্য একটি গোপন কোডওয়ার্ড ঠিক করুন — "নতুন নম্বর, জরুরি টাকা" ফাঁদ সহজেই ঠেকবে।</p>
      <div class="card glow"><b>🔑 আপনার ফ্যামিলি কোডওয়ার্ড</b><div class="code" id="cw" style="margin:12px 0">${esc(S.codeword || '— এখনো বানানো হয়নি —')}</div>
        <div class="row"><button class="btn pri" id="gen">🎲 নতুন বানান</button><input class="field" id="own" placeholder="অথবা নিজের লিখুন" maxlength="24" style="flex:1;min-width:150px"><button class="btn" id="setc">সংরক্ষণ</button></div>
        <p class="sm mut" style="margin-top:10px">কোডওয়ার্ড শুধু পরিবারের কাছে বলুন — মেসেজে বা অনলাইনে লিখবেন না। কেউ "নতুন নম্বর থেকে" টাকা চাইলে আগে কোডওয়ার্ড জিজ্ঞেস করুন।</p></div>
      <div class="card"><b>📤 পরিবারকে শেখান</b><div class="row" style="margin-top:10px"><button class="btn" id="card">🖼️ শেয়ার কার্ড বানান</button><button class="btn" id="wa">💬 হোয়াটসঅ্যাপে পাঠান</button></div><div id="cardout" style="margin-top:12px"></div></div>
      <div class="card"><b>👵 বয়স্কদের জন্য বড় লেখা</b><p class="sm mut">অ্যাপের লেখা বড় করুন যাতে বাবা-মা সহজে পড়তে পারেন।</p><div class="row" style="margin-top:10px"><button class="btn" id="bigt">${S.big ? '✔ বড় লেখা চালু — বন্ধ করুন' : 'বড় লেখা চালু করুন'}</button></div></div>
      <div class="card"><b>🌟 ৫ সোনালি নিয়ম</b>${rules}</div></div>`;
    const cw = $('#cw');
    function setCode(v) { S.codeword = v; save(); cw.textContent = v; award('family'); toast('কোডওয়ার্ড সংরক্ষিত 🔑'); }
    $('#gen').onclick = () => setCode(SG.CODEWORDS[Math.floor(Math.random() * SG.CODEWORDS.length)] + '-' + bn(Math.floor(10 + Math.random() * 89)));
    $('#setc').onclick = () => { const v = $('#own').value.trim(); if (v.length < 3) return toast('কমপক্ষে ৩ অক্ষর দিন', true); setCode(v); };
    $('#bigt').onclick = () => { S.big = !S.big; save(); applyBig(); VIEWS.shield(); };
    const shareText = '🛡️ পরিবারের নিরাপত্তায় ৫ নিয়ম:\n' + SG.GOLDEN_RULES.map((r, i) => `${bn(i + 1)}. ${r[1]}`).join('\n') + '\n\nসবাই মিলে স্ক্যামের বিরুদ্ধে অনুশীলন করুন — Scam Gym: ' + location.origin;
    $('#wa').onclick = () => waShare(shareText);
    $('#card').onclick = () => {
      const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const x = c.getContext && c.getContext('2d');
      if (!x) return toast('এই ডিভাইসে কার্ড বানানো যাচ্ছে না', true);
      const ft0 = x.fillText.bind(x); x.fillText = (t, a, b, m) => ft0(tx(t), a, b, m);
      const g = x.createLinearGradient(0, 0, 1080, 1350); g.addColorStop(0, '#0D2B2C'); g.addColorStop(1, '#17695A'); x.fillStyle = g; x.fillRect(0, 0, 1080, 1350);
      x.fillStyle = '#BFE3D2'; x.font = '800 64px "Fraunces","Noto Serif Bengali",serif'; x.fillText('🛡️ ScamGym', 70, 120);
      x.fillStyle = '#fff'; x.font = '700 58px "Noto Serif Bengali",serif'; x.fillText('পরিবারের ৫ সোনালি নিয়ম', 70, 230);
      x.font = '500 44px "Hind Siliguri",sans-serif'; SG.GOLDEN_RULES.forEach((r, i) => { x.fillStyle = '#BFE3D2'; x.fillText(bn(i + 1) + '.', 70, 340 + i * 150); x.fillStyle = '#fff'; x.fillText(r[1], 150, 340 + i * 150); x.fillStyle = '#9FBDB4'; x.font = '400 32px "Hind Siliguri",sans-serif'; x.fillText(r[2], 150, 385 + i * 150); x.font = '500 44px "Hind Siliguri",sans-serif'; });
      x.fillStyle = '#BFE3D2'; x.font = '600 38px "Hind Siliguri",sans-serif'; x.fillText('আমাদের ফ্যামিলি কোডওয়ার্ড আছে 🔑', 70, 1190); x.fillStyle = '#9FBDB4'; x.font = '400 30px sans-serif'; x.fillText('Scam Gym · FutureTech.ai', 70, 1270);
      let url = ''; try { url = c.toDataURL('image/png'); } catch (e) { return toast('কার্ড বানানো যায়নি', true); }
      $('#cardout').innerHTML = `<img class="share-c" src="${url}" alt="শেয়ার কার্ড" style="width:100%;max-width:380px"><div style="margin-top:8px"><a class="btn sm" download="scamgym-family-rules.png" href="${url}">⬇️ ডাউনলোড</a></div>`;
    };
  };
  function applyBig() { document.body.classList.toggle('big', !!S.big); const b = $('#bigBtn'); if (b) b.setAttribute('aria-pressed', S.big ? 'true' : 'false'); }

  /* =========================================================
     PROFILE
  ========================================================= */
  function radarCard() {
    const keys = Object.keys(SG.TACTICS), n = keys.length, cx = 150, cy = 150, R = 100;
    const data = keys.map((k) => { const t = S.tac[k] || { seen: 0, fell: 0 }; return { k, seen: t.seen, rate: t.seen ? t.fell / t.seen : 0 }; });
    if (!data.some((d) => d.seen > 0)) return '<div class="card"><b>দুর্বলতার রাডার</b><p class="sm mut">কয়েকটি সিমুলেশন খেললে এখানে দেখা যাবে আপনি কোন কৌশলে বেশি ধরা খান।</p></div>';
    const pt = (i, r) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [(cx + Math.cos(a) * r).toFixed(1), (cy + Math.sin(a) * r).toFixed(1)]; };
    const rings = [0.25, 0.5, 0.75, 1].map((f) => `<polygon points="${keys.map((_, i) => pt(i, R * f).join(',')).join(' ')}" fill="none" stroke="rgba(13,43,44,.18)"/>`).join('');
    const axes = keys.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, R)[0]}" y2="${pt(i, R)[1]}" stroke="rgba(13,43,44,.12)"/>`).join('');
    const poly = data.map((d, i) => pt(i, R * Math.max(d.rate, 0.05)).join(',')).join(' ');
    const lab = data.map((d, i) => { const p = pt(i, R + 20); return `<text x="${p[0]}" y="${p[1]}" text-anchor="middle" dominant-baseline="middle" font-size="16">${SG.TACTICS[d.k].i}</text>`; }).join('');
    const weak = data.filter((d) => d.seen > 0).sort((a, b) => b.rate - a.rate)[0];
    let tip = '';
    if (weak && weak.rate > 0) {
      const rec = SG.SCENARIOS.slice().sort((a, b) => b.steps.filter((s) => s.tactics.includes(weak.k)).length - a.steps.filter((s) => s.tactics.includes(weak.k)).length)[0];
      tip = `<p style="margin-top:8px"><b>সবচেয়ে দুর্বল জায়গা:</b> ${SG.TACTICS[weak.k].i} ${tx(SG.TACTICS[weak.k].l)} (${bn(Math.round(weak.rate * 100))}% ক্ষেত্রে ধরা খেয়েছেন)</p><a class="btn sm" style="margin-top:8px" href="#/play/${rec.id}">অনুশীলন করুন: ${rec.icon} ${esc(rec.title)}</a>`;
    } else tip = '<p style="margin-top:8px">এ পর্যন্ত কোনো কৌশলে ধরা খাননি। চমৎকার!</p>';
    return `<div class="card"><b>দুর্বলতার রাডার</b><p class="sm mut">যত বাইরে, তত বেশি ধরা খেয়েছেন।</p><svg viewBox="0 0 300 300" style="width:100%;max-width:340px;display:block;margin:6px auto" role="img" aria-label="দুর্বলতার রাডার চার্ট">${rings}${axes}<polygon points="${poly}" fill="rgba(179,23,62,.22)" stroke="#b3173e" stroke-width="2"/>${lab}</svg>${tip}</div>`;
  }

  VIEWS.me = function () {
    const ri = rankInfo(S.xp);
    const prog = SG.SCENARIOS.map((s) => { const d = S.done[s.id]; return `<div class="row sp" style="padding:9px 0;border-top:1px solid var(--line)"><span>${s.icon} ${esc(s.title)}</span><span>${stars(d ? d.best : 0)}</span></div>`; }).join('');
    V.innerHTML = `<div class="stack"><div class="card glow"><div class="lvl"><div class="ico">${ri.cur.i}</div><div style="flex:1"><h2>${ri.cur.n}</h2><div class="bar" style="margin:8px 0 4px"><i style="width:${ri.pct}%"></i></div><span class="sm mut">${bn(S.xp)} XP${ri.nx ? ' · পরের র‍্যাংক: ' + ri.nx.n + ' (' + bn(ri.nx.xp) + ' XP)' : ' · সর্বোচ্চ র‍্যাংক!'}</span></div></div></div>
      <div class="row"><a class="btn pri" href="#/cert">আমার সনদ</a><a class="btn" href="#/audit">সুরক্ষা অডিট</a></div>
      <div class="stat"><div><b>${bn(S.wins)}</b><span>জয়</span></div><div><b>${bn(S.scans)}</b><span>স্ক্যান</span></div><div><b>🔥${bn(S.streak)}</b><span>দিনের স্ট্রিক</span></div></div>
      ${radarCard()}
      <div class="card"><b>🏅 ব্যাজ</b><div class="badges" style="margin-top:12px">${SG.BADGES.map((b) => `<div class="badge ${S.badges[b.id] ? '' : 'lock'}"><i>${b.i}</i><b>${esc(b.n)}</b><small>${esc(b.d)}</small></div>`).join('')}</div></div>
      <div class="card"><b>⚡ সিমুলেশন অগ্রগতি</b><div style="margin-top:8px">${prog}</div></div>
      <div class="row"><button class="btn sm ghost" id="rst">🗑️ অগ্রগতি মুছুন</button></div></div>`;
    $('#rst').onclick = () => { if (confirm('সব অগ্রগতি মুছে যাবে। নিশ্চিত?')) { S = defaults(); save(); applyBig(); route(); } };
  };

  /* =========================================================
     নতুন ফিচার: দ্রুত যাচাই, ১০ মিনিট বিরতি, সুরক্ষা অডিট, সনদ
  ========================================================= */
  [{ id: 'audit', i: '🔐', n: 'সুরক্ষা অডিট', d: 'অডিটে ৮০% বা বেশি স্কোর' }, { id: 'cert', i: '📜', n: 'সনদধারী', d: 'সনদ ডাউনলোড করুন' }, { id: 'triage', i: '🩺', n: 'দ্রুত যাচাই', d: 'দ্রুত যাচাই সম্পন্ন করুন' }, { id: 'pause', i: '⏳', n: 'ধৈর্যশীল', d: '১০ মিনিটের বিরতি শেষ করুন' }]
    .forEach((b) => { if (!SG.BADGES.some((x) => x.id === b.id)) SG.BADGES.push(b); });

  VIEWS.triage = function () {
    const Q = [
      ['কেউ কি ফোন বা মেসেজে আপনার OTP, পিন বা পাসওয়ার্ড চেয়েছে?', 'otp'],
      ['"এখনই", "১০ মিনিটে" বা "অ্যাকাউন্ট বন্ধ হবে" বলে তাড়া বা ভয় দেখানো হচ্ছে?', 'urg'],
      ['কেউ কি আগাম ফি, চার্জ বা টাকা পাঠাতে বলেছে?', 'pay'],
      ['বিষয়টি পরিবার বা অন্য কাউকে না জানাতে বলা হয়েছে?', 'sec'],
      ['অচেনা লিংকে ক্লিক করেছেন, অথবা কোনো অ্যাপ (APK, AnyDesk) ইনস্টল করেছেন?', 'link'],
      ['আপনি কি ইতিমধ্যে টাকা পাঠিয়েছেন বা OTP/তথ্য দিয়ে ফেলেছেন?', 'done']
    ];
    const ans = {}; let i = 0;
    function ask() {
      if (i >= Q.length) return verdict();
      V.innerHTML = `<div class="play" style="max-width:560px"><div class="row sp" style="margin-bottom:10px"><a class="btn sm ghost" href="#/home">← হোম</a><span class="pill">প্রশ্ন ${bn(i + 1)}/${bn(Q.length)}</span></div>
        <div class="bar" style="margin-bottom:14px"><i style="width:${(i / Q.length) * 100}%"></i></div>
        <div class="card glow"><h2 class="q">${esc(Q[i][0])}</h2><div class="stack"><button class="opt" id="y">হ্যাঁ</button><button class="opt" id="n">না</button></div></div></div>`;
      const nx = (v) => () => { ans[Q[i][1]] = v; i++; ask(); };
      $('#y').onclick = nx(1); $('#n').onclick = nx(0);
    }
    function verdict() {
      const n = ['otp', 'urg', 'pay', 'sec', 'link'].reduce((s, k) => s + (ans[k] ? 1 : 0), 0);
      let key, title, acts, cta;
      if (ans.done) {
        key = 'no'; title = 'ক্ষতি হয়ে থাকতে পারে, এখনই পদক্ষেপ নিন';
        acts = ['ব্যাংক বা মোবাইল ব্যাংকিং হেল্পলাইনে এখনই ফোন করে লেনদেন আটকাতে বলুন।', 'পিন ও পাসওয়ার্ড বদলান, রিমোট অ্যাপ বা অচেনা APK মুছুন।', 'স্ক্রিনশট রাখুন, তারপর প্রতারকের সাথে যোগাযোগ বন্ধ করুন।'];
        cta = '<a class="btn bad" href="#/sos">SOS গাইড খুলুন</a>';
      } else if (ans.otp || ans.pay || n >= 3) {
        key = 'no'; title = 'প্রায় নিশ্চিত প্রতারণা, থামুন';
        acts = ['কল কেটে দিন বা উত্তর দেওয়া বন্ধ করুন। কিছু পাঠাবেন না, কোনো কোড বলবেন না।', 'নিজে অ্যাপ খুলে বা অফিসিয়াল নম্বরে ফোন করে যাচাই করুন।', 'নম্বরটি ব্লক ও রিপোর্ট করুন, পরিবারের কাউকে জানান।'];
        cta = '<a class="btn pri" href="#/pause">১০ মিনিট বিরতি নিন</a> <a class="btn" href="#/scan">মেসেজ স্ক্যান করুন</a>';
      } else if (n >= 1) {
        key = 'warn'; title = 'সন্দেহজনক, যাচাই না করে এগোবেন না';
        acts = ['কিছু করার আগে অফিসিয়াল চ্যানেলে নিজে ফোন করে নিশ্চিত হন।', 'আসা মেসেজ বা লিংক স্ক্যানারে দিয়ে দেখুন।'];
        cta = '<a class="btn pri" href="#/scan">স্ক্যানারে দেখুন</a>';
      } else {
        key = 'ok'; title = 'এখনো স্পষ্ট লাল পতাকা নেই';
        acts = ['তবু অচেনা কেউ OTP, পিন বা টাকা চাইলে থামুন।', 'পরিবারের জন্য একটি কোডওয়ার্ড ঠিক করে রাখুন।'];
        cta = '<a class="btn pri" href="#/shield">ফ্যামিলি শিল্ড</a>';
      }
      if (!S.badges.triage) addXP(15);
      award('triage');
      V.innerHTML = `<div class="play" style="max-width:560px"><div class="card result glow"><div class="stamp ${key === 'ok' ? 'ok' : 'no'}">${key === 'ok' ? 'ঝুঁকি কম' : key === 'warn' ? 'সতর্ক থাকুন' : 'বিপদ'}</div><h2>${title}</h2>
        <div class="listed"><ul>${acts.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>
        <div class="row" style="justify-content:center;margin-top:18px">${cta}<a class="btn" href="#/triage" id="rs">আবার যাচাই</a></div></div></div>`;
      $('#rs').addEventListener('click', () => setTimeout(route, 0));
    }
    ask();
  };

  VIEWS.pause = function () {
    const checks = ['প্রাপককে আমি ব্যক্তিগতভাবে চিনি এবং নিজে নিশ্চিত হয়েছি।', 'অফিসিয়াল নম্বরে নিজে ফোন করে বিষয়টি যাচাই করেছি।', 'কেউ আমাকে তাড়া দিচ্ছে না, বা আমি তাড়ার কথা মানছি না।', 'কোনো আগাম ফি, চার্জ বা "রিফান্ডের জন্য টাকা" চাওয়া হয়নি।', 'পরিবারের একজনকে বিষয়টি জানিয়েছি।'];
    const total = FAST ? 3 : 600; let left = total, timer = null, started = false, finished = false;
    const fmt = (s) => bn(String(Math.floor(s / 60)).padStart(2, '0')) + ':' + bn(String(s % 60).padStart(2, '0'));
    V.innerHTML = `<div class="stack" style="max-width:640px;margin:0 auto"><h1>১০ মিনিটের বিরতি</h1>
      <p class="mut">প্রতারকেরা তাড়ার ওপর ভর করে। টাকা পাঠানোর আগে ১০ মিনিট থামুন এবং নিচের প্রশ্নগুলো মিলিয়ে নিন।</p>
      <div class="card glow c"><div class="code" id="tm">${fmt(total)}</div><div class="bar" style="margin:14px 0"><i id="tb" style="width:0%"></i></div><button class="btn pri" id="st">বিরতি শুরু করুন</button></div>
      <div class="card"><b>বিরতির মধ্যে যাচাই করুন</b>${checks.map((c, i) => `<label class="chk"><input type="checkbox" data-i="${i}"><div>${esc(c)}</div></label>`).join('')}</div>
      <div class="notice" id="vd">টাইমার শুরু করুন এবং সব প্রশ্নে টিক দিন।</div></div>`;
    const update = () => {
      const all = $$('.chk input').every((x) => x.checked);
      $('#vd').textContent = !started ? 'টাইমার শুরু করুন এবং সব প্রশ্নে টিক দিন।' : !finished ? 'সময় শেষ হওয়া পর্যন্ত অপেক্ষা করুন। এর মধ্যে কিছু পাঠাবেন না।' : all ? 'যাচাই সম্পন্ন। তবুও মনে সন্দেহ থাকলে টাকা পাঠাবেন না।' : 'সবগুলো প্রশ্নে "হ্যাঁ" না হলে টাকা পাঠাবেন না।';
    };
    $$('.chk input').forEach((x) => x.addEventListener('change', update));
    $('#st').onclick = () => {
      if (started) return; started = true; $('#st').disabled = true; $('#st').textContent = 'বিরতি চলছে…'; update();
      timer = setInterval(() => {
        left--; $('#tm').textContent = fmt(Math.max(left, 0)); $('#tb').style.width = ((total - left) / total) * 100 + '%';
        if (left <= 0) { clearInterval(timer); finished = true; $('#st').textContent = 'বিরতি শেষ'; if (!S.badges.pause) addXP(20); award('pause'); update(); }
      }, FAST ? 20 : 1000);
    };
    cleanup = () => { if (timer) clearInterval(timer); };
  };

  VIEWS.audit = function () {
    const items = [
      ['2fa', 'ফেসবুক, জিমেইল ও গুরুত্বপূর্ণ অ্যাকাউন্টে টু-স্টেপ ভেরিফিকেশন চালু', 'পাসওয়ার্ড ফাঁস হলেও অ্যাকাউন্ট দখল ঠেকায়।'],
      ['pin', 'মোবাইল ব্যাংকিং পিন কারো সাথে শেয়ার করিনি এবং তা জন্মতারিখ বা ফোন নম্বর নয়', 'সহজ পিন অনুমান করা যায়।'],
      ['lock', 'ফোনে স্ক্রিন লক (পিন, প্যাটার্ন বা ফিঙ্গারপ্রিন্ট) আছে', 'ফোন হারালে বা চুরি হলে প্রথম বাধা।'],
      ['apk', 'অচেনা সোর্স থেকে APK ইনস্টল বন্ধ রেখেছি', 'ভুয়া অ্যাপ থেকেই বেশিরভাগ ফোন-দখল হয়।'],
      ['uniq', 'ইমেইল ও ব্যাংকিংয়ে আলাদা পাসওয়ার্ড ব্যবহার করি', 'এক পাসওয়ার্ড ফাঁস হলে সব যায় না।'],
      ['code', 'পরিবারের কোডওয়ার্ড ঠিক করা আছে', 'আপনজন সেজে টাকা চাওয়ার ফাঁদ ঠেকায়।'],
      ['help', 'ব্যাংক ও মোবাইল ব্যাংকিংয়ের অফিসিয়াল হেল্পলাইন নম্বর ফোনে সেভ করা আছে', 'বিপদে ভুয়া নম্বর খুঁজতে হয় না।'],
      ['privacy', 'ফেসবুকে ফোন নম্বর, NID বা কার্ডের ছবি পাবলিক নয়', 'প্রতারকেরা এসব দেখে নিখুঁত গল্প সাজায়।'],
      ['alert', 'লেনদেনের SMS বা অ্যালার্ট চালু আছে', 'অচেনা লেনদেন সঙ্গে সঙ্গে ধরা পড়ে।'],
      ['nid', 'NID বা ব্যক্তিগত কাগজের ছবি অচেনা কাউকে পাঠাই না', 'এগুলো দিয়ে নতুন সিম বা ঋণ নেওয়া যায়।']
    ];
    const done = (id) => (id === 'code' ? !!S.codeword : !!S.audit[id]);
    const score = () => Math.round((items.filter((x) => done(x[0])).length / items.length) * 100);
    V.innerHTML = `<div class="stack" style="max-width:680px;margin:0 auto"><h1>সুরক্ষা অডিট</h1><p class="mut">আপনার ডিজিটাল সুরক্ষার দশটি বিষয় মিলিয়ে দেখুন। এখানে কিছুই সার্ভারে যায় না।</p>
      <div class="card glow c" id="sc"></div>
      <div class="card"><b>আপনার তালিকা</b>${items.map((x) => `<label class="chk"><input type="checkbox" data-id="${x[0]}" ${done(x[0]) ? 'checked' : ''} ${x[0] === 'code' ? 'disabled' : ''}><div>${esc(x[1])}${x[0] === 'code' && !S.codeword ? ' <a class="sm" style="text-decoration:underline" href="#/shield">কোডওয়ার্ড বানান</a>' : ''}</div></label>`).join('')}</div>
      <div class="card" id="nx"></div></div>`;
    function paint() {
      const sc = score(), key = sc >= 80 ? 'low' : sc >= 50 ? 'mid' : 'critical', col = { low: '#1f7a55', mid: '#c98a1b', critical: '#b3173e' }[key], C = 2 * Math.PI * 70;
      $('#sc').innerHTML = `<div class="gauge"><div class="rs" aria-hidden="true">${rosette({ n: 30, rx: 48, ry: 14, sw: 0.4 })}</div><svg viewBox="0 0 160 160"><circle cx="80" cy="80" r="70" fill="none" stroke="rgba(13,43,44,.12)" stroke-width="14"/><circle cx="80" cy="80" r="70" fill="none" stroke="${col}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C - (sc / 100) * C}"/></svg><div class="v"><div><b style="color:${col}">${bn(sc)}%</b><span><br>সুরক্ষা স্কোর</span></div></div></div>
        <p style="margin-top:10px">${sc >= 80 ? 'চমৎকার, আপনি বেশ সুরক্ষিত।' : sc >= 50 ? 'মোটামুটি, কয়েকটি ফাঁক বন্ধ করুন।' : 'ঝুঁকি বেশি, নিচের কাজগুলো আগে করুন।'}</p>`;
      const miss = items.filter((x) => !done(x[0]));
      $('#nx').innerHTML = miss.length ? `<b>পরের কাজ</b><ul class="ul">${miss.slice(0, 4).map((x) => `<li>${esc(x[1])}. <span class="mut">${esc(x[2])}</span></li>`).join('')}</ul>` : '<b>সব কাজ সম্পন্ন। ধন্যবাদ!</b>';
      if (sc >= 80) award('audit');
    }
    $$('.chk input').forEach((x) => x.addEventListener('change', () => { if (!x.dataset.id) return; S.audit[x.dataset.id] = x.checked ? 1 : 0; save(); paint(); }));
    paint();
  };

  VIEWS.cert = function () {
    const ri = rankInfo(S.xp);
    const iq = Math.min(99, 35 + Math.floor(S.xp / 25) + S.spotBest * 2 + Math.min(S.scans, 10));
    V.innerHTML = `<div class="stack" style="max-width:680px;margin:0 auto"><h1>প্রশিক্ষণ সনদ</h1>
      <div class="card glow"><div class="row sp"><div><div class="iq">${bn(iq)}</div><div class="sm mut">আপনার স্ক্যাম আইকিউ</div></div><div class="c"><div style="font-size:2rem">${ri.cur.i}</div><b style="font-family:var(--disp)">${ri.cur.n}</b></div></div>
        <p class="sm mut" style="margin-top:10px">আইকিউ বাড়ে সিমুলেশন জিতলে, স্পট গেম খেললে ও স্ক্যান করলে।</p>
        <label class="l" for="nm">সনদে যে নাম থাকবে</label><input class="field" id="nm" maxlength="40" value="${esc(S.name)}" placeholder="আপনার নাম">
        <div class="row" style="margin-top:14px"><button class="btn pri" id="mk">সনদ বানান</button></div></div>
      <div id="co" class="c"></div></div>`;
    $('#mk').onclick = async () => {
      const name = $('#nm').value.trim(); if (!name) return toast('আগে নাম লিখুন', true);
      S.name = name; save();
      const c = document.createElement('canvas'); c.width = 1600; c.height = 1130;
      const x = c.getContext && c.getContext('2d'); if (!x) return toast('এই ডিভাইসে সনদ বানানো যাচ্ছে না', true);
      const ft0 = x.fillText.bind(x); x.fillText = (t, a, b, m) => ft0(tx(t), a, b, m);
      try { await Promise.all([document.fonts.load('800 80px "Noto Serif Bengali"'), document.fonts.load('600 30px "Hind Siliguri"'), document.fonts.load('800 80px "Fraunces"')]); } catch (e) { /* ফন্ট না এলেও চলবে */ }
      const rs = (cx, cy, n, rx, ry, col, lw) => { x.strokeStyle = col; x.lineWidth = lw; for (let k = 0; k < n; k++) { x.save(); x.translate(cx, cy); x.rotate((k * Math.PI) / n); x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); x.stroke(); x.restore(); } };
      x.fillStyle = '#f5f9f5'; x.fillRect(0, 0, 1600, 1130);
      rs(800, 565, 56, 480, 170, 'rgba(23,105,90,.13)', 1.4);
      x.strokeStyle = '#0d2b2c'; x.lineWidth = 6; x.strokeRect(40, 40, 1520, 1050); x.lineWidth = 2; x.strokeRect(58, 58, 1484, 1014);
      [[120, 120], [1480, 120], [120, 1010], [1480, 1010]].forEach((p) => rs(p[0], p[1], 20, 62, 22, '#17695a', 1.4));
      x.textAlign = 'center'; x.fillStyle = '#0d2b2c';
      x.font = '800 92px "Noto Serif Bengali",serif'; x.fillText('প্রশিক্ষণ সনদ', 800, 250);
      x.fillStyle = '#17695a'; x.font = '600 34px "Hind Siliguri",sans-serif'; x.fillText('Scam Gym, স্ক্যাম প্রতিরোধ প্রশিক্ষণ', 800, 310);
      x.fillStyle = '#2f4a49'; x.font = '500 36px "Hind Siliguri",sans-serif'; x.fillText('এই মর্মে প্রত্যয়ন করা যাচ্ছে যে', 800, 410);
      x.fillStyle = '#0d2b2c'; x.font = '800 100px "Noto Serif Bengali",serif'; x.fillText(name, 800, 540);
      x.fillRect(360, 575, 880, 3);
      x.fillStyle = '#2f4a49'; x.font = '500 36px "Hind Siliguri",sans-serif'; x.fillText('অনুশীলনের মাধ্যমে প্রতারণা চেনা ও ঠেকানোর দক্ষতা অর্জন করে র‍্যাংক পেয়েছেন', 800, 650);
      x.fillStyle = '#0d2b2c'; x.font = '800 64px "Noto Serif Bengali",serif'; x.fillText(ri.cur.n, 800, 735);
      x.fillStyle = '#17695a'; x.font = '800 150px "Fraunces","Noto Serif Bengali",serif'; x.fillText(bn(iq), 800, 890);
      x.fillStyle = '#566e6c'; x.font = '500 30px "Hind Siliguri",sans-serif'; x.fillText('স্ক্যাম আইকিউ', 800, 940);
      x.textAlign = 'left'; x.fillStyle = '#2f4a49'; x.font = '600 28px "Fraunces","Hind Siliguri",sans-serif'; x.fillText('ক্রমিক নং SG-' + bn(S.serial), 120, 1030);
      x.textAlign = 'right'; x.fillText(new Date().toLocaleDateString(LANG === 'en' ? 'en-GB' : 'bn-BD'), 1480, 1030);
      x.textAlign = 'center'; x.fillStyle = '#566e6c'; x.font = '400 11px sans-serif'; x.fillText('স্ক্যাম জিম প্রশিক্ষণ সনদ '.repeat(26), 800, 1062);
      let url = ''; try { url = c.toDataURL('image/png'); } catch (e) { return toast('সনদ বানানো যায়নি', true); }
      $('#co').innerHTML = `<img class="cert-img" src="${url}" alt="প্রশিক্ষণ সনদ"><div class="row" style="justify-content:center;margin-top:14px"><a class="btn pri" download="scamgym-certificate.png" href="${url}">ডাউনলোড</a><button class="btn" id="cs">শেয়ার করুন</button></div>`;
      $('#cs').onclick = () => waShare('আমি Scam Gym-এর প্রশিক্ষণ সম্পন্ন করে "' + ri.cur.n + '" র‍্যাংক পেয়েছি, স্ক্যাম আইকিউ ' + bn(iq) + '। তুমিও চেষ্টা করো: ' + location.origin);
      if (!S.badges.cert) addXP(25);
      award('cert');
    };
  };

  /* =========================================================
     boot
  ========================================================= */
  if (SG.extend) SG.extend({ VIEWS, get V() { return V; }, get S() { return S; }, restoreS: (snap) => { S = Object.assign(defaults(), snap); save(); }, save, $, $$, esc, bn, tx, L, toast, addXP, award, rosette, stars, speak, copy, waShare, aiCall, aiStatus, wait, SC, route, rankInfo, PERSONAS, dayKey, lang: () => LANG, FAST, setCleanup: (f) => { cleanup = f; }, shuffle });
  $('#bigBtn').addEventListener('click', () => { S.big = !S.big; save(); applyBig(); toast(S.big ? 'বড় লেখা চালু' : 'বড় লেখা বন্ধ'); });
  $('#moreBtn').addEventListener('click', () => { const m = $('#more'); m.hidden = !m.hidden; $('#moreBtn').setAttribute('aria-expanded', String(!m.hidden)); });
  $('#more').addEventListener('click', (e) => { if (e.target.id === 'more' || e.target.closest('a')) closeMore(); });
  window.addEventListener('hashchange', route);
  try { if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('sw.js'); } catch (e) { /* PWA ঐচ্ছিক */ }
  const lg = $('#logo'); if (lg) lg.innerHTML = rosette({ n: 14, rx: 46, ry: 16, sw: 3 });
  const dm = $('#dmore'); if (dm) dm.addEventListener('click', () => { const m = $('#more'); m.hidden = !m.hidden; });
  const lbtn = $('#langBtn');
  if (lbtn) lbtn.addEventListener('click', () => { LANG = LANG === 'en' ? 'bn' : 'en'; S.lang = LANG; save(); route(); applyLang(); });
  new MutationObserver(trSoon).observe(document.body, { childList: true, subtree: true });
  applyBig(); touchDay(); aiStatus();
  window.SG.__route = route;
  route();
  applyLang();
})();
