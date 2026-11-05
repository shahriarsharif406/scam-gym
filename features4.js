/* Scam Gym — শেয়ারযোগ্য স্কোর কার্ড, পরিবারকে চ্যালেঞ্জ, ৬০ সেকেন্ডের কুইক ট্রাই */
(function () {
  'use strict';
  const SG = window.SG;
  SG.exts = SG.exts || [];

  SG.exts.push(function (c) {
    const { VIEWS, $, esc, L, tx, toast, save, bn, waShare, copy, rankInfo } = c;
    SG.tx = tx;
    const st = () => c.S;
    const V = () => c.V;
    const iq = () => (SG.iqOf ? SG.iqOf() : 40);
    const totalStars = () => SG.SCENARIOS.reduce((t, x) => t + (st().done[x.id] ? st().done[x.id].best : 0), 0);
    const wonN = () => SG.SCENARIOS.filter((x) => st().done[x.id] && st().done[x.id].wins).length;
    const base = () => location.origin + location.pathname;

    /* ---------- ১. শেয়ারযোগ্য স্কোর কার্ড (১০৮০×১৩৫০ PNG) ---------- */
    function loadImg(src) { return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }
    function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
    async function drawCard() {
      const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350;
      const x = cv.getContext && cv.getContext('2d'); if (!x) return null;
      const ft0 = x.fillText.bind(x); x.fillText = (t, a, b, m) => ft0(tx(String(t)), a, b, m);
      try { await Promise.all([document.fonts.load('800 80px "Fraunces"'), document.fonts.load('700 40px "Hind Siliguri"'), document.fonts.load('800 80px "Noto Serif Bengali"')]); } catch (e) { /* ignore */ }
      const g = x.createLinearGradient(0, 0, 1080, 1350); g.addColorStop(0, '#2a1a7a'); g.addColorStop(0.55, '#14125a'); g.addColorStop(1, '#0a0726'); x.fillStyle = g; x.fillRect(0, 0, 1080, 1350);
      const sky = x.createLinearGradient(0, 0, 0, 420); sky.addColorStop(0, '#6d4fe0'); sky.addColorStop(0.6, '#f08ab0'); sky.addColorStop(1, '#ffd08a'); x.fillStyle = sky; x.fillRect(0, 0, 1080, 420);
      const sun = x.createRadialGradient(780, 300, 6, 780, 300, 210); sun.addColorStop(0, 'rgba(255,244,190,1)'); sun.addColorStop(0.3, 'rgba(255,214,140,.55)'); sun.addColorStop(1, 'rgba(255,214,140,0)'); x.fillStyle = sun; x.fillRect(0, 60, 1080, 420);
      const hills = (y, amp, f, ph, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, 420); for (let a = 0; a <= 1080; a += 20) x.lineTo(a, y + amp * Math.sin(a * f + ph) + amp * 0.5 * Math.sin(a * f * 2.3 + ph * 2)); x.lineTo(1080, 420); x.closePath(); x.fill(); };
      hills(330, 26, 0.006, 1, 'rgba(90,70,170,.75)'); hills(366, 20, 0.009, 3, 'rgba(40,90,100,.9)'); hills(396, 14, 0.013, 5, '#12353a');
      x.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 4; i++) { x.beginPath(); x.ellipse(150 + i * 260, 360 + (i % 2) * 14, 110, 14, 0, 0, 7); x.fill(); }
      x.textAlign = 'left'; x.fillStyle = '#fff'; x.font = '800 56px "Fraunces","Noto Serif Bengali",serif'; x.fillText('Scam Gym', 64, 108);
      x.font = '600 26px "Hind Siliguri",sans-serif'; x.fillStyle = 'rgba(255,255,255,.92)'; x.fillText(L('প্রতারকের মুখোমুখি হওয়ার আগে অনুশীলন', 'Practise before you meet a real scammer'), 64, 152);
      const ri = rankInfo(st().xp);
      x.save(); rr(x, 64, 470, 952, 560, 44); x.fillStyle = 'rgba(255,255,255,.07)'; x.fill(); x.lineWidth = 2; x.strokeStyle = 'rgba(196,181,253,.5)'; x.stroke(); x.restore();
      x.textAlign = 'center'; x.fillStyle = '#c4b5fd'; x.font = '600 34px "Hind Siliguri",sans-serif'; x.fillText(st().name ? st().name : L('স্ক্যাম ফাইটার', 'Scam fighter'), 540, 540);
      x.fillStyle = '#fff'; x.font = '800 84px "Noto Serif Bengali","Fraunces",serif'; x.fillText(ri.cur.i + ' ' + ri.cur.n, 540, 650);
      const gr = x.createLinearGradient(300, 0, 780, 0); gr.addColorStop(0, '#22d3ee'); gr.addColorStop(1, '#a78bfa'); x.fillStyle = gr; x.font = '800 230px "Fraunces",serif'; x.fillText(bn(iq()), 540, 860);
      x.fillStyle = 'rgba(255,255,255,.85)'; x.font = '600 34px "Hind Siliguri",sans-serif'; x.fillText(L('স্ক্যাম আইকিউ', 'Scam IQ'), 540, 912);
      const stat = [[bn(wonN()) + '/' + bn(SG.SCENARIOS.length), L('সিমুলেশন জয়', 'Simulations won')], [bn(totalStars()) + ' ★', L('তারা', 'Stars')], ['🔥 ' + bn(st().streak), L('দিনের স্ট্রিক', 'Day streak')]];
      stat.forEach((s, i) => { const cx = 210 + i * 330; x.fillStyle = '#fff'; x.font = '800 48px "Fraunces","Noto Serif Bengali",serif'; x.fillText(s[0], cx, 985); x.fillStyle = 'rgba(255,255,255,.7)'; x.font = '500 24px "Hind Siliguri",sans-serif'; x.fillText(s[1], cx, 1020); });
      x.fillStyle = '#fff'; x.font = '700 40px "Hind Siliguri",sans-serif'; x.fillText(L('আমার স্কোর ছাড়াতে পারবে?', 'Can you beat my score?'), 540, 1100);
      const sk = await loadImg('assets/sticker.png');
      if (sk) { const w = 440, h = w * sk.height / sk.width; x.save(); rr(x, 540 - w / 2 - 8, 1124, w + 16, h + 16, 20); x.fillStyle = '#fff'; x.fill(); x.restore(); x.drawImage(sk, 540 - w / 2, 1132, w, h); }
      x.fillStyle = 'rgba(255,255,255,.75)'; x.font = '500 26px "Hind Siliguri",sans-serif'; x.fillText(/^(localhost|127\.)/.test(location.host) || !location.host ? 'Scam Gym' : location.host, 540, 1326);
      try { return cv.toDataURL('image/png'); } catch (e) { return null; }
    }
    VIEWS.share = async function () {
      V().innerHTML = `<div class="stack" style="max-width:560px;margin:0 auto"><h1>${L('আমার স্কোর কার্ড', 'My score card')}</h1><p class="mut">${L('ছবিটি ডাউনলোড করে বা সরাসরি পাঠিয়ে বন্ধু-পরিবারকে চ্যালেঞ্জ করুন।', 'Download the image or send it straight to friends and family.')}</p>
        <div class="card"><label class="l" for="nm">${L('কার্ডে যে নাম থাকবে', 'Name on the card')}</label><input class="field" id="nm" maxlength="30" value="${esc(st().name)}" placeholder="${L('আপনার নাম', 'Your name')}"></div>
        <div id="co" class="c"><p class="mut">${L('কার্ড তৈরি হচ্ছে…', 'Making your card…')}</p></div></div>`;
      const build = async () => {
        const url = await drawCard(); const co = $('#co'); if (!co) return;
        if (!url) { co.innerHTML = `<p class="mut">${L('এই ডিভাইসে কার্ড বানানো যায়নি।', 'Could not make the card on this device.')}</p>`; return; }
        co.innerHTML = `<img class="cert-img" src="${url}" alt="${L('স্কোর কার্ড', 'Score card')}" style="max-width:100%;border-radius:18px"><div class="row" style="justify-content:center;margin-top:14px"><a class="btn pri" download="scamgym-score.png" href="${url}">${L('ডাউনলোড', 'Download')}</a><button class="btn" id="shn">${L('শেয়ার করুন', 'Share')}</button></div>`;
        $('#shn').onclick = async () => {
          const msg = L('আমি Scam Gym-এ স্ক্যাম আইকিউ ' + bn(iq()) + ' পেয়েছি। আমার স্কোর ছাড়াতে পারবে? ', 'I scored ' + iq() + ' Scam IQ on Scam Gym. Can you beat me? ') + base();
          try { const b = await (await fetch(url)).blob(); const f = new File([b], 'scamgym-score.png', { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], text: msg }); return; } } catch (e) { /* fallback */ }
          waShare(msg);
        };
      };
      await build();
      const nm = $('#nm'); let t = 0;
      if (nm) nm.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { st().name = nm.value.trim(); save(); build(); }, 450); });
    };

    /* ---------- ২. পরিবারকে চ্যালেঞ্জ ---------- */
    VIEWS.family = function () {
      const list = SG.SCENARIOS;
      const best = (s) => (st().done[s.id] ? st().done[s.id].best : 0);
      V().innerHTML = `<div class="stack" style="max-width:640px;margin:0 auto"><h1>${L('পরিবারকে চ্যালেঞ্জ', 'Challenge your family')}</h1>
        <p class="mut">${L('একটি সিমুলেশন বেছে লিংক পাঠান। প্রিয়জন লিংক খুললেই সরাসরি সেই সিমুলেশন শুরু হবে এবং আপনার তারা ছাড়াতে চেষ্টা করবে।', 'Pick a simulation and send the link. They land straight in it and try to beat your stars.')}</p>
        <div class="card"><label class="l" for="fn">${L('আপনার নাম', 'Your name')}</label><input class="field" id="fn" maxlength="30" value="${esc(st().name)}" placeholder="${L('আপনার নাম', 'Your name')}">
        <label class="l" for="fs" style="margin-top:12px">${L('সিমুলেশন', 'Simulation')}</label><select class="field" id="fs">${list.map((s) => `<option value="${s.id}">${s.icon} ${esc(s.title)}${best(s) ? ' · ' + '★'.repeat(best(s)) : ''}</option>`).join('')}</select>
        <div class="notice" style="margin-top:12px" id="fi"></div>
        <div class="row" style="margin-top:12px"><button class="btn pri" id="fw">${L('WhatsApp-এ পাঠান', 'Send on WhatsApp')}</button><button class="btn" id="fc">${L('লিংক কপি', 'Copy link')}</button></div></div>
        <div class="card"><b>${L('বয়স্কদের জন্য টিপস', 'Tip for older relatives')}</b><p class="sm mut" style="margin-top:6px">${L('প্রথমে সহজ লেভেলের সিমুলেশন দিন, আর অ্যাপে "Aa" চাপলে বড় লেখা চালু হয়।', 'Start with a level-1 simulation. The "Aa" button turns on large text.')}</p></div></div>`;
      const link = () => { const id = $('#fs').value, s = list.find((x) => x.id === id); return base() + '#/play/' + id + '/' + Math.max(1, best(s)) + '/' + encodeURIComponent($('#fn').value.trim()); };
      const info = () => { const s = list.find((x) => x.id === $('#fs').value); $('#fi').textContent = L('লক্ষ্য: ', 'Target: ') + '★'.repeat(Math.max(1, best(s))) + (best(s) ? '' : L(' (আপনি এখনো খেলেননি, লক্ষ্য ১ তারা)', ' (you have not played it, target is 1 star)')); };
      $('#fs').onchange = info; info();
      const msg = () => { const s = list.find((x) => x.id === $('#fs').value); const n = $('#fn').value.trim(); if (n) { st().name = n; save(); } return L('প্রতারক চেনার একটা খেলা: "' + s.title + '"। আমি ' + best(s) + ' তারা পেয়েছি, তুমি পারবে? ', 'A game about spotting scams: "' + s.title + '". I got ' + best(s) + ' stars. Can you beat me? ') + link(); };
      $('#fw').onclick = () => waShare(msg());
      $('#fc').onclick = () => copy(msg());
    };

    /* ---------- ৩. কুইক ট্রাই: ৬০ সেকেন্ডে সবচেয়ে সহজ সিমুলেশন ---------- */
    VIEWS.quick = function () {
      const s = SG.SCENARIOS.find((x) => x.level === 1 && x.ui === 'chat') || SG.SCENARIOS[0];
      location.replace('#/play/' + s.id);
    };

    /* ---------- বাটন বসানো: হোম, ফলাফল পেজ ও আমার পেজ ---------- */
    function inject() {
      const v = V(); if (!v) return;
      const hr = v.querySelector('.hero .row');
      if (hr && !hr.querySelector('[data-q]')) { const a = document.createElement('a'); a.className = 'btn pri'; a.href = '#/quick'; a.setAttribute('data-q', '1'); a.textContent = L('⚡ ৬০ সেকেন্ডে চেষ্টা করুন', '⚡ Try it in 60 seconds'); hr.insertBefore(a, hr.firstChild); }
      const rs = v.querySelector('.result .row');
      if (rs && !rs.querySelector('[data-sc]')) { const a = document.createElement('a'); a.className = 'btn'; a.href = '#/share'; a.setAttribute('data-sc', '1'); a.textContent = L('🖼️ স্কোর কার্ড', '🖼️ Score card'); rs.appendChild(a); const b = document.createElement('a'); b.className = 'btn'; b.href = '#/family'; b.textContent = L('👨‍👩‍👧 পরিবারকে চ্যালেঞ্জ', '👨‍👩‍👧 Challenge family'); rs.appendChild(b); }
      const ce = v.querySelector('a.btn[href="#/cert"]'), me = ce && ce.parentNode;
      if (me && me.classList.contains('row') && !me.querySelector('[data-sc]')) { const a = document.createElement('a'); a.className = 'btn'; a.href = '#/share'; a.setAttribute('data-sc', '1'); a.textContent = L('🖼️ স্কোর কার্ড', '🖼️ Score card'); me.appendChild(a); const b = document.createElement('a'); b.className = 'btn'; b.href = '#/family'; b.textContent = L('👨‍👩‍👧 পরিবার', '👨‍👩‍👧 Family'); me.appendChild(b); }
    }
    let busy = false;
    const mo = new MutationObserver(() => { if (busy) return; busy = true; setTimeout(() => { busy = false; try { inject(); } catch (e) { /* ignore */ } }, 60); });
    const hook = () => { const v = V(); if (v) mo.observe(v, { childList: true, subtree: true }); };
    hook(); inject();
  });
})();
