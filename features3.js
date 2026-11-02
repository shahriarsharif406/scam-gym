/* Scam Gym — অফলাইন প্যাক: অফলাইন স্ট্যাটাস ও ইনস্টল, প্রোগ্রেস ব্যাকআপ/রিস্টোর, জরুরি কার্ড */
(function () {
  'use strict';
  const SG = window.SG;
  SG.exts = SG.exts || [];

  SG.exts.push(function (c) {
    const { VIEWS, $, esc, L, tx, toast, save, FAST } = c;
    const st = () => c.S;
    const CACHE = 'scamgym-v8';
    let deferred = null;
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
    window.addEventListener('appinstalled', () => { deferred = null; toast(L('অ্যাপ ইনস্টল হয়েছে', 'App installed')); });

    /* ---------- অফলাইন স্ট্যাটাস ---------- */
    const status = { n: 0, ready: false };
    async function probe() {
      try {
        if (!window.caches) return;
        const ks = await caches.keys();
        if (ks.indexOf(CACHE) === -1) return;
        const ch = await caches.open(CACHE); const rq = await ch.keys();
        status.n = rq.length; status.ready = rq.length >= 20;
      } catch (e) { /* ignore */ }
    }
    const online = () => navigator.onLine !== false;
    function pillHTML() {
      if (!online()) return `<span class="op off">${L('অফলাইন মোড', 'Offline mode')}</span>`;
      return status.ready ? `<span class="op ok">${L('✓ অফলাইনে চলবে', '✓ Works offline')}</span>` : `<span class="op">${L('অফলাইন প্রস্তুত হচ্ছে…', 'Getting ready for offline…')}</span>`;
    }
    function mountPill() {
      const f = document.querySelector('.foot'); if (!f) return;
      let a = $('#offpill'); if (!a) { a = document.createElement('a'); a.id = 'offpill'; a.href = '#/offline'; a.className = 'offpill'; f.insertBefore(a, f.firstChild); }
      a.innerHTML = pillHTML();
      let b = $('#offbar');
      if (!online()) { if (!b) { b = document.createElement('div'); b.id = 'offbar'; b.className = 'offbar'; b.setAttribute('role', 'status'); document.body.insertBefore(b, document.body.firstChild); } b.textContent = L('ইন্টারনেট নেই। অ্যাপ অফলাইনে চলছে। লাইভ AI ছাড়া সবকিছু কাজ করবে।', 'No internet. The app keeps working offline, except the live AI.'); }
      else if (b) b.remove();
    }
    const refresh = async () => { const was = status.ready; await probe(); mountPill(); if (status.ready !== was && location.hash === '#/offline' && VIEWS.offline) VIEWS.offline(); };
    window.addEventListener('online', () => { toast(L('ইন্টারনেট ফিরেছে', 'Back online')); refresh(); });
    window.addEventListener('offline', () => { toast(L('অফলাইন, তবুও অ্যাপ চলবে', 'Offline, the app still works')); refresh(); });
    window.addEventListener('hashchange', mountPill);
    if (navigator.serviceWorker && navigator.serviceWorker.ready) navigator.serviceWorker.ready.then(() => setTimeout(refresh, FAST ? 0 : 800)).catch(() => {});
    refresh();
    SG.offlineRefresh = refresh;

    /* ---------- ব্যাকআপ ---------- */
    function download(name, blob) { const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
    function exportData() {
      const d = Object.assign({}, st()); delete d.codeword; // গোপন শব্দ কখনো ফাইলে যায় না
      return JSON.stringify({ app: 'scamgym', v: 1, exported: new Date().toISOString(), data: d }, null, 1);
    }
    function parseBackup(txt) {
      let o; try { o = JSON.parse(txt); } catch (e) { return { err: L('ফাইলটি পড়া যায়নি। এটি Scam Gym-এর ব্যাকআপ নয়।', 'Could not read the file. It is not a Scam Gym backup.') }; }
      if (!o || o.app !== 'scamgym' || !o.data || typeof o.data !== 'object') return { err: L('এটি Scam Gym-এর ব্যাকআপ ফাইল নয়।', 'This is not a Scam Gym backup file.') };
      const d = o.data;
      if (typeof d.xp !== 'number' || d.xp < 0 || typeof d.done !== 'object' || typeof d.badges !== 'object') return { err: L('ফাইলের তথ্য অসম্পূর্ণ বা নষ্ট।', 'The file data is incomplete or damaged.') };
      delete d.codeword; return { d };
    }
    SG.parseBackup = parseBackup; SG.exportData = exportData;

    VIEWS.offline = async function () {
      await probe();
      const s = st(), ios = /iphone|ipad/i.test(navigator.userAgent), standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
      const stat = !online() ? L('এখন অফলাইন, অ্যাপ চলছে', 'Offline right now, the app is running') : status.ready ? L('প্রস্তুত। ইন্টারনেট ছাড়াই চলবে', 'Ready. Works without internet') : L('প্রথমবার খুলেছেন। একবার পুরো লোড হলে প্রস্তুত হবে', 'First visit. It will be ready once everything finishes loading');
      c.V.innerHTML = `<div class="play"><h1 style="font-size:1.8rem">📴 ${L('অফলাইন ও ব্যাকআপ', 'Offline and backup')}</h1>
        <p class="mut" style="margin:6px 0 14px">${L('সিগন্যাল নেই? সমস্যা নেই। শেখা, যাচাই আর জরুরি তথ্য সবই ফোনে থাকে।', 'No signal? No problem. Practice, checking and emergency info all live on your phone.')}</p>
        <div class="card ${status.ready && online() ? 'offok' : ''}"><h2 class="sec" style="margin-top:0">${L('অফলাইন অবস্থা', 'Offline status')}</h2>
          <p><b>${stat}</b></p><p class="sm mut">${status.ready ? L(`${status.n}টি ফাইল ফোনে সংরক্ষিত।`, `${status.n} files stored on your device.`) : ''}</p>
          <div class="row" style="margin-top:10px">${standalone ? `<span class="chip">${L('✓ ইনস্টল করা আছে', '✓ Installed')}</span>` : deferred ? `<button class="btn pri" id="inst">${L('হোম স্ক্রিনে ইনস্টল করুন', 'Install to home screen')}</button>` : `<span class="sm mut">${ios ? L('iPhone-এ: Share বাটন ▸ "Add to Home Screen"।', 'On iPhone: Share ▸ "Add to Home Screen".') : L('ব্রাউজারের মেনু থেকে "Install app" বা "Add to Home screen" বেছে নিন।', 'Use the browser menu: "Install app" or "Add to Home screen".')}</span>`}</div></div>
        <div class="card"><h3 style="margin:0 0 6px">${L('অফলাইনে যা চলে', 'What works offline')}</h3>
          <ul class="offl"><li>⚡ ${L(`অ্যারেনার সব ${SG.SCENARIOS.length}টি সিমুলেশন`, `All ${SG.SCENARIOS.length} arena simulations`)}</li><li>🔎 ${L('মেসেজ স্ক্যানার ও লিংক ডিটেক্টর (নিয়ম-ভিত্তিক)', 'Message scanner and link detector (rule-based)')}</li><li>🎙️ ${L('ভয়েস কল, অফলাইন বিচার ইঞ্জিনসহ', 'Voice call with the offline judge')}</li><li>🗝️ ${L('সিক্রেট ওয়ার্ড, SOS গাইড, জরুরি কার্ড', 'Secret word, SOS guide, emergency card')}</li></ul>
          <p class="sm mut" style="margin-top:8px">${L('শুধু লাইভ AI আর AI-বিশ্লেষণ ইন্টারনেট চায়। বন্ধ থাকলে অ্যাপ নিজে থেকে অফলাইন বিকল্পে যায়।', 'Only the live AI and AI analysis need internet. Without it the app falls back to the offline mode on its own.')}</p></div>
        <div class="card"><h3 style="margin:0 0 6px">💾 ${L('প্রোগ্রেস ব্যাকআপ', 'Progress backup')}</h3>
          <p class="sm mut">${L('XP, ব্যাজ, স্কোর আর পরিবারের নাম একটি ফাইলে সেভ করুন। ফোন বদলালে ফাইলটি দিয়ে ফিরিয়ে আনুন। কোনো সার্ভারে যায় না। সিক্রেট ওয়ার্ড ফাইলে রাখা হয় না।', 'Save XP, badges, scores and family names to one file and restore it on a new phone. Nothing goes to a server. The secret word is never put in the file.')}</p>
          <div class="row" style="margin-top:10px"><button class="btn pri" id="bk-ex">${L('ব্যাকআপ ডাউনলোড', 'Download backup')}</button><label class="btn" for="bk-in" style="cursor:pointer">${L('ব্যাকআপ থেকে ফিরিয়ে আনুন', 'Restore from backup')}</label><input id="bk-in" type="file" accept="application/json,.json" hidden></div>
          <div id="bk-msg" class="sm" style="margin-top:10px" role="status"></div></div>
        <div class="card"><a class="btn" href="#/card" style="width:100%">🪪 ${L('জরুরি কার্ড খুলুন', 'Open the emergency card')}</a></div></div>`;
      const inst = $('#inst'); if (inst) inst.onclick = async () => { try { deferred.prompt(); await deferred.userChoice; } catch (e) { /* ignore */ } deferred = null; VIEWS.offline(); };
      $('#bk-ex').onclick = () => { download('scam-gym-backup-' + new Date().toISOString().slice(0, 10) + '.json', new Blob([exportData()], { type: 'application/json' })); $('#bk-msg').textContent = L('ব্যাকআপ ফাইল নামানো হয়েছে।', 'Backup file downloaded.'); };
      $('#bk-in').onchange = (e) => {
        const f = e.target.files && e.target.files[0]; if (!f) return; const msg = $('#bk-msg');
        if (f.size > 1e6) { msg.textContent = L('ফাইলটি অনেক বড়, এটি ব্যাকআপ নয়।', 'The file is too large to be a backup.'); return; }
        const r = new FileReader();
        r.onload = () => {
          const p = parseBackup(String(r.result));
          if (p.err) { msg.innerHTML = `<span style="color:var(--stamp)">${esc(p.err)}</span>`; return; }
          msg.innerHTML = `${L(`এই ফাইলে ${p.d.xp} XP পাওয়া গেছে। এখনকার প্রোগ্রেস এটি দিয়ে বদলে যাবে।`, `This file holds ${p.d.xp} XP. It will replace your current progress.`)} <button class="btn pri" id="bk-ok" style="margin-top:8px">${L('হ্যাঁ, ফিরিয়ে আনুন', 'Yes, restore')}</button>`;
          $('#bk-ok').onclick = () => { const keep = st().codeword; c.restoreS(Object.assign(p.d, keep ? { codeword: keep } : {})); toast(L('প্রোগ্রেস ফিরে এসেছে', 'Progress restored')); location.hash = '#/me'; };
        };
        r.readAsText(f);
      };
    };

    /* ---------- জরুরি কার্ড ---------- */
    const steps = () => [
      L('থামুন। কল কেটে দিন, উত্তর দেওয়ার তাড়া নেই।', 'Stop. Hang up; there is no rush to reply.'),
      L('OTP, পিন, পাসওয়ার্ড কাউকে বলবেন না।', 'Never share an OTP, PIN or password.'),
      L('টাকা চলে গেলে সঙ্গে সঙ্গে প্রোভাইডারের হেল্পলাইনে জানান। ট্রানজেকশন আইডি রাখুন।', 'If money left, call the provider helpline at once. Keep the transaction ID.'),
      L('স্ক্রিনশট রাখুন, তারপর নম্বর ব্লক করুন।', 'Keep screenshots, then block the number.'),
      L('হুমকি বা ব্ল্যাকমেইল হলে ৯৯৯। টাকা দেবেন না।', 'For threats or blackmail call 999. Do not pay.'),
      L('এনআইডি বা সিমের তথ্য দিয়ে ফেললে অপারেটরকে জানান।', 'If you gave NID or SIM details, tell your operator.')
    ];
    const ec = () => st().ec || {};
    function cardHTML() {
      const e = ec();
      return `<div class="ecard" id="ecard"><div class="ec-h"><span class="ec-ro">${c.rosette({ n: 18, rx: 22, ry: 7, sw: 0.5 })}</span><div><b>${L('জরুরি কার্ড', 'Emergency card')}</b><span class="sm">${L('প্রতারণার শিকার হলে', 'If you are being scammed')}</span></div></div>
        <ol class="ec-s">${steps().map((s) => `<li>${s}</li>`).join('')}</ol>
        <div class="ec-hl">${SG.HELPLINES.map((h) => `<a href="tel:${h.tel}"><b class="mono">${esc(h.tel)}</b><span>${esc(tx(h.d))}</span></a>`).join('')}</div>
        <div class="ec-me"><span class="sm">${L('আমার বিশ্বস্ত ব্যক্তি', 'My trusted person')}</span><b>${esc(e.n || '—')}</b> <span class="mono">${esc(e.t || '')}</span></div></div>`;
    }
    VIEWS.card = function () {
      const e = ec();
      c.V.innerHTML = `<div class="play"><h1 style="font-size:1.8rem">🪪 ${L('জরুরি কার্ড', 'Emergency card')}</h1>
        <p class="mut" style="margin:6px 0 14px">${L('একটি পাতায় করণীয় আর হেল্পলাইন। ছবি করে গ্যালারিতে রাখুন, লক স্ক্রিনে দিন বা প্রিন্ট করুন। ইন্টারনেট ছাড়াই খোলে।', 'Steps and helplines on one page. Save it as an image, use it as a lock-screen wallpaper, or print it. Opens without internet.')}</p>
        <div class="card"><label class="sm" for="ec-n">${L('বিশ্বস্ত ব্যক্তির নাম (ঐচ্ছিক)', 'Trusted person name (optional)')}</label><input id="ec-n" class="inp" maxlength="40" value="${esc(e.n || '')}" autocomplete="off">
          <label class="sm" for="ec-t" style="margin-top:8px;display:block">${L('তার ফোন নম্বর', 'Their phone number')}</label><input id="ec-t" class="inp" maxlength="20" inputmode="tel" value="${esc(e.t || '')}" autocomplete="off">
          <p class="sm mut" style="margin-top:6px">${L('এটি শুধু আপনার ফোনে থাকে।', 'This stays only on your phone.')}</p></div>
        <div id="ecwrap">${cardHTML()}</div>
        <div class="row" style="margin:12px 0"><button class="btn pri" id="ec-png">${L('ছবি হিসেবে সেভ', 'Save as image')}</button><button class="btn" id="ec-pr">${L('প্রিন্ট', 'Print')}</button></div>
        <p class="sm mut">⚠️ ${L('নম্বরগুলো ব্যবহারের আগে অফিসিয়াল ওয়েবসাইট বা কার্ড থেকে মিলিয়ে নিন।', 'Check the numbers against the official website or your card before relying on them.')}</p></div>`;
      const upd = () => { st().ec = { n: $('#ec-n').value.trim(), t: $('#ec-t').value.trim() }; save(); $('#ecwrap').innerHTML = cardHTML(); };
      $('#ec-n').oninput = upd; $('#ec-t').oninput = upd;
      $('#ec-pr').onclick = () => { document.body.classList.add('printing-card'); try { window.print(); } catch (e2) { /* ignore */ } setTimeout(() => document.body.classList.remove('printing-card'), 500); };
      $('#ec-png').onclick = async () => { try { await png(); } catch (e3) { toast(L('ছবি বানানো যায়নি। স্ক্রিনশট নিন।', 'Could not make the image. Take a screenshot.')); } };
    };

    async function png() {
      try { await Promise.all(["700 30px 'Noto Serif Bengali'", "700 30px 'Hind Siliguri'", "500 30px 'JetBrains Mono'", "800 30px Fraunces"].map((f) => document.fonts.load(f, 'অa1'))); } catch (e) { /* ignore */ }
      const STEPS = steps(), W = 1080, e = ec(), hl = SG.HELPLINES, H = 330 + STEPS.length * 120 + hl.length * 92 + 330;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
      const SER = "'Noto Serif Bengali','Hind Siliguri',serif", SAN = "'Hind Siliguri',sans-serif", MON = "'JetBrains Mono',monospace";
      x.fillStyle = '#f4f1e6'; x.fillRect(0, 0, W, H);
      x.strokeStyle = '#0d2b2c'; x.lineWidth = 6; x.strokeRect(24, 24, W - 48, H - 48); x.lineWidth = 2; x.strokeRect(40, 40, W - 80, H - 80);
      x.fillStyle = '#0d2b2c'; x.fillRect(40, 40, W - 80, 170);
      x.fillStyle = '#fff'; x.font = '800 62px ' + SER; x.textBaseline = 'alphabetic'; x.fillText(L('জরুরি কার্ড', 'Emergency card'), 90, 135);
      x.fillStyle = '#ffd166'; x.font = '500 30px ' + SAN; x.fillText(L('প্রতারণার শিকার হলে', 'If you are being scammed'), 90, 182);
      x.fillStyle = '#ffd166'; x.font = '800 30px ' + SER; x.textAlign = 'right'; x.fillText('Scam Gym', W - 90, 135); x.textAlign = 'left';
      const wrap = (t, mx, fnt) => { x.font = fnt; const w = t.split(' '), ls = []; let l = ''; w.forEach((k) => { const tt = l ? l + ' ' + k : k; if (x.measureText(tt).width > mx && l) { ls.push(l); l = k; } else l = tt; }); if (l) ls.push(l); return ls; };
      let y = 270;
      STEPS.forEach((s, i) => {
        x.fillStyle = '#0d2b2c'; x.beginPath(); x.arc(100, y - 12, 26, 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = '700 28px ' + MON; x.textAlign = 'center'; x.fillText(String(i + 1), 100, y - 2); x.textAlign = 'left';
        x.fillStyle = '#10302f'; wrap(s, W - 260, '600 32px ' + SAN).slice(0, 2).forEach((ln, j) => x.fillText(ln, 150, y + j * 40 - 4));
        y += 120;
      });
      y += 10; x.fillStyle = '#0d2b2c'; x.fillRect(70, y - 30, W - 140, 3); y += 30;
      hl.forEach((h) => {
        x.fillStyle = '#b0123a'; x.font = '800 40px ' + MON; x.fillText(h.tel, 80, y + 22);
        x.fillStyle = '#10302f'; wrap(tx(h.d), W - 420, '500 28px ' + SAN).slice(0, 2).forEach((ln, j) => x.fillText(ln, 330, y + j * 34 + 12));
        y += 92;
      });
      y += 16; x.fillStyle = '#0d2b2c'; x.fillRect(70, y, W - 140, 3);
      x.fillStyle = '#10302f'; x.font = '500 28px ' + SAN; x.fillText(L('আমার বিশ্বস্ত ব্যক্তি', 'My trusted person'), 80, y + 56);
      x.font = '700 38px ' + SER; x.fillText(e.n || '—', 80, y + 108); x.font = '700 38px ' + MON; x.fillText(e.t || '', 80, y + 158);
      x.fillStyle = '#5d6b6b'; x.font = '500 22px ' + SAN; x.fillText(L('নম্বর ব্যবহারের আগে অফিসিয়াল সূত্র থেকে মিলিয়ে নিন।', 'Verify numbers against official sources before use.'), 80, H - 70);
      const blob = await new Promise((r) => cv.toBlob(r, 'image/png')); if (!blob) throw new Error('png');
      download('scam-gym-emergency-card.png', blob);
    }
  });
})();
