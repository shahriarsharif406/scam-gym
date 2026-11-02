/* Scam Gym — নতুন ফিচার (২): ভয়েস কল সিমুলেশন ও ৯০ সেকেন্ডের ডেমো ট্যুর */
(function () {
  'use strict';
  const SG = window.SG;
  SG.exts = SG.exts || [];

  SG.exts.push(function (c) {
    const { VIEWS, $, $$, esc, bn, L, tx, toast, addXP, award, rosette, aiCall, aiStatus, wait, SC, save, FAST } = c;
    const st = () => c.S;
    const sleep = (ms) => new Promise((r) => setTimeout(r, FAST ? 0 : ms));
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const hasTTS = () => { try { return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'; } catch (e) { return false; } };

    /* =========================================================
       ভয়েস কল সিমুলেশন
    ========================================================= */
    const VOICE_IDS = ['bkash', 'family', 'authority', 'job', 'invest'];
    VIEWS.voice = async function (pid) {
      const list = c.PERSONAS.filter((p) => VOICE_IDS.includes(p.id));
      if (!pid) {
        c.V.innerHTML = `<div class="play"><h1 style="font-size:1.8rem">🎙️ ${L('ভয়েস কল সিমুলেশন', 'Voice call simulator')}</h1>
          <p class="mut" style="margin:6px 0 14px">${L('বাংলাদেশের বেশিরভাগ প্রতারণা ফোনকলে হয়। এখানে প্রতারক ফোনে কথা বলবে, আপনি মুখে উত্তর দিন (বা টাইপ করুন)। চাপের মধ্যে ঠান্ডা থাকার অনুশীলন।', 'Most scams in Bangladesh happen over phone calls. Here the scammer talks on a call and you answer out loud (or type). Practice staying calm under pressure.')}</p>
          <div class="notice" style="margin-bottom:14px">${SR ? L('🎤 আপনার ব্রাউজার মাইক সমর্থন করে। প্রথমবার অনুমতি চাইবে। কথা আপনার ডিভাইসের স্পিচ সার্ভিসে প্রক্রিয়া হয়।', '🎤 Your browser supports the microphone. It asks permission the first time. Speech is processed by your device\'s speech service.') : L('⌨️ এই ব্রাউজারে মাইক চালু করা যাচ্ছে না, তাই উত্তর টাইপ করতে হবে। Chrome বা Edge-এ মুখে উত্তর দেওয়া যায়।', '⌨️ This browser cannot use the microphone, so you will type your answers. Chrome or Edge allow speaking.')}</div>
          <div class="stack">${list.map((p) => `<a class="sc" href="#/voice/${p.id}"><div class="ico">${p.icon}</div><div><h3>${esc(p.n)}</h3><p class="sm mut">${esc(p.d)}</p></div></a>`).join('')}</div></div>`;
        return;
      }
      const p = list.find((x) => x.id === pid); if (!p) { location.hash = '#/voice'; return; }
      const scen = p.scen ? SG.SCENARIOS.find((s) => s.id === p.scen) : null;
      const lines = p.lines || scen.steps.map((s) => s.msg);
      let ai = await aiStatus();
      if (location.hash.indexOf('#/voice/' + pid) !== 0) return;
      const hist = []; let locked = false, guard = 100, safeN = 0, turns = 0, over = false, li = 0, busy = false, muted = false, rec = null, tick = null, secs = 0, started = false;
      const EN = c.lang() === 'en';
      c.V.innerHTML = `<div class="play"><div class="row sp" style="margin-bottom:10px"><a class="btn sm ghost" href="#/voice">← ${L('বদলান', 'Change')}</a><span class="pill ${ai ? 'ok' : 'warn'}" id="vai">${ai ? L('🟢 AI চালু', '🟢 AI on') : L('🟡 অফলাইন ইঞ্জিন', '🟡 Offline engine')}</span></div>
        <div class="callui" id="cu"><div class="cu-bg" aria-hidden="true">${rosette({ n: 36, rx: 48, ry: 15, sw: 0.4, rings: 2 })}</div>
          <div class="cu-in"><div class="cu-state" id="vst">${L('ইনকামিং কল', 'Incoming call')}</div>
          <div class="cu-av" id="vav"><span class="ring r1"></span><span class="ring r2"></span><span class="av">${p.icon}</span></div>
          <div class="wave" aria-hidden="true">${'<i></i>'.repeat(26)}</div><h2 class="cu-name">${esc(p.n)}</h2><div class="cu-tm" id="tm">${L('অচেনা নম্বর', 'Unknown number')}</div>
          <div class="cu-cap" id="cap" aria-live="polite"></div>
          <div class="cu-you" id="you"></div>
          <div class="guard dark"><div class="row sp sm"><span>🛡️ ${L('আপনার সুরক্ষা', 'Your safety')}</span><b id="gv">${bn(100)}%</b></div><div class="seg" id="seg"></div></div>
          <div class="cu-act" id="act"><button class="cbtn acc" id="answer" aria-label="${L('কল ধরুন', 'Answer')}"><i>📞</i><span>${L('ধরুন', 'Answer')}</span></button></div></div></div>
        <form class="inp" id="vf" hidden><input id="vt" autocomplete="off" maxlength="300" placeholder="${L('উত্তর টাইপ করুন…', 'Type your answer…')}" aria-label="${L('আপনার উত্তর', 'Your answer')}"><button class="btn pri" type="submit" id="vsend">${L('পাঠান', 'Send')}</button></form>
        <div class="notice" id="vnote" style="margin-top:12px" hidden></div>
        <details class="card" style="margin-top:12px" id="trd"><summary><b>📝 ${L('কথোপকথনের লেখা', 'Call transcript')}</b></summary><div class="tlog" id="tlog" role="log"></div></details></div>`;
      const cap = $('#cap'), you = $('#you'), tlog = $('#tlog'), vst = $('#vst'), form = $('#vf'), inp = $('#vt');
      const guardUI = () => { $('#gv').textContent = bn(Math.max(guard, 0)) + '%'; $('#seg').innerHTML = [0, 1, 2, 3].map((i) => `<i class="${guard > i * 25 ? 'on' : ''} ${guard <= 50 ? 'low' : ''}"></i>`).join(''); };
      const log = (cls, text) => { const d = document.createElement('div'); d.className = 'tl ' + cls; d.textContent = text; tlog.appendChild(d); return d; };
      const state = (k) => { $('#cu').dataset.s = k; vst.textContent = { ring: L('ইনকামিং কল', 'Incoming call'), speak: L('প্রতারক বলছে…', 'Scammer speaking…'), listen: L('আপনার পালা, বলুন…', 'Your turn, speak…'), think: L('ভাবছে…', 'Thinking…'), over: L('কল শেষ', 'Call ended') }[k]; };
      const note = (t) => { const n = $('#vnote'); n.hidden = !t; n.textContent = t || ''; };
      const coachTxt = { safe: L('✅ ভালো চাল! আপনি যাচাই/প্রত্যাখ্যানের পথে আছেন।', '✅ Good move! You are heading towards verifying or refusing.'), risky: L('⚠️ আলাপ চালিয়ে গেলে প্রতারক আরও চাপ দেবে। প্রত্যাখ্যান করুন ও নিজে যাচাই করুন।', '⚠️ Staying on the call lets the scammer push harder. Refuse and verify on your own.'), fatal: L('❌ তথ্য বা টাকা দিয়ে ফেলেছেন। আসল জীবনে এটাই ক্ষতির মুহূর্ত।', '❌ You gave away details or money. In real life this is the moment of loss.') };
      const stopSpeech = () => { try { if (hasTTS()) speechSynthesis.cancel(); } catch (e) { /* ignore */ } };
      const stopRec = () => { try { if (rec) { rec.onend = null; rec.onresult = null; rec.onerror = null; rec.abort(); } } catch (e) { /* ignore */ } rec = null; };
      c.setCleanup(() => { stopSpeech(); stopRec(); if (tick) clearInterval(tick); over = true; });

      /* কথা বলানো */
      function say(text, done) {
        const out = tx(text); cap.textContent = out;
        if (!hasTTS() || muted || FAST) { setTimeout(done, FAST ? 0 : Math.min(4500, 900 + out.length * 55)); return; }
        try {
          const u = new SpeechSynthesisUtterance(out); u.lang = EN ? 'en-US' : 'bn-BD'; u.rate = 0.96; u.pitch = 0.85;
          const vs = speechSynthesis.getVoices(), v = vs.find((x) => (EN ? /^en/i : /^bn/i).test(x.lang));
          if (v) u.voice = v; else if (!EN) note(L('এই ডিভাইসে বাংলা কণ্ঠ পাওয়া যায়নি। নিচে লেখা ক্যাপশন পড়ে উত্তর দিন।', 'No Bangla voice found on this device. Read the captions and answer.'));
          let fin = false; const go = () => { if (!fin) { fin = true; done(); } };
          u.onend = go; u.onerror = go; setTimeout(go, 15000);
          speechSynthesis.cancel(); speechSynthesis.speak(u);
        } catch (e) { setTimeout(done, 1500); }
      }
      function listen() {
        if (over) return; state('listen'); you.textContent = ''; busy = false; locked = false;
        form.hidden = false;
        if (!SR) { inp.focus(); return; }
        stopRec();
        try {
          rec = new SR(); rec.lang = EN ? 'en-US' : 'bn-BD'; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
          let finalT = '';
          rec.onresult = (e) => { let t = ''; for (let i = e.resultIndex; i < e.results.length; i++) { t += e.results[i][0].transcript; if (e.results[i].isFinal) finalT = t; } you.textContent = '🎤 ' + t; if (finalT) { const v = finalT; stopRec(); turn(v); } };
          rec.onerror = (e) => { stopRec(); if (e && e.error === 'not-allowed') note(L('মাইকের অনুমতি দেওয়া হয়নি। নিচের ঘরে টাইপ করে উত্তর দিন।', 'Microphone permission was denied. Type your answer below.')); else if (e && e.error !== 'aborted') you.textContent = L('শোনা যায়নি। মাইক বোতাম আবার চাপুন বা টাইপ করুন।', 'Could not hear you. Tap the mic again or type.'); };
          rec.onend = () => { rec = null; };
          rec.start(); $('#mic') && $('#mic').classList.add('live');
        } catch (e) { rec = null; }
      }
      function acts(on) {
        $('#act').innerHTML = on ? `<button class="cbtn" id="mute" aria-pressed="${muted}" aria-label="${L('কণ্ঠ বন্ধ/চালু', 'Mute voice')}"><i>${muted ? '🔇' : '🔊'}</i><span>${muted ? L('কণ্ঠ বন্ধ', 'Muted') : L('কণ্ঠ চালু', 'Voice on')}</span></button>
          ${SR ? `<button class="cbtn acc" id="mic" aria-label="${L('মুখে বলুন', 'Speak')}"><i>🎤</i><span>${L('বলুন', 'Speak')}</span></button>` : ''}
          <button class="cbtn bad" id="hang" aria-label="${L('কল কেটে ব্লক করুন', 'Hang up and block')}"><i>📵</i><span>${L('কেটে ব্লক', 'Hang up')}</span></button>` : '';
        if (!on) return;
        $('#mute').onclick = () => { muted = !muted; if (muted) stopSpeech(); acts(true); };
        const m = $('#mic'); if (m) m.onclick = () => { if (busy && !over) { stopSpeech(); } listen(); };
        $('#hang').onclick = () => { if (!over) { log('sys', L('📵 আপনি কল কেটে ব্লক করেছেন।', '📵 You hung up and blocked the number.')); end('exit'); } };
      }

      /* ইঞ্জিন */
      function localTurn(t) {
        const danger = SC.judgeReply(t), msg = lines[Math.min(li, lines.length - 1)]; li++;
        return { scammer: danger === 'safe' && li > lines.length ? 'ঠিক আছে, তাহলে থাক…' : msg, coach: coachTxt[danger], danger };
      }
      async function speakScammer(text) {
        log('them', tx(text)); hist.push({ role: 'scammer', text });
        state('speak'); busy = true;
        await new Promise((r) => say(text, r));
      }
      async function opening() {
        state('think'); await sleep(500);
        let first = lines[0]; li = 1;
        if (ai) { try { const r = await aiCall('/api/chat', { persona: pid, history: [] }); if (r && r.scammer) first = r.scammer; } catch (e) { ai = false; $('#vai').className = 'pill warn'; $('#vai').textContent = L('🟡 অফলাইন ইঞ্জিন', '🟡 Offline engine'); } }
        acts(true); await speakScammer(first); listen();
      }
      async function turn(text) {
        text = String(text || '').trim(); if (!text || over) return;
        if (locked) return; locked = true;
        stopRec(); stopSpeech(); turns++; busy = true; you.textContent = '';
        log('me', text); hist.push({ role: 'user', text }); state('think');
        let res = null;
        if (ai) { try { res = await aiCall('/api/chat', { persona: pid, history: hist.slice(-16) }); } catch (e) { ai = false; $('#vai').className = 'pill warn'; $('#vai').textContent = L('🟡 অফলাইন ইঞ্জিন', '🟡 Offline engine'); toast(L('AI সংযোগ হয়নি। অফলাইন ইঞ্জিনে চলছে', 'AI unavailable. Using the offline engine'), true); } }
        if (!res || !res.scammer) res = localTurn(text);
        const d = ['safe', 'risky', 'fatal'].includes(res.danger) ? res.danger : 'risky';
        if (d === 'safe') safeN++;
        if (d === 'risky') guard -= 25;
        if (d === 'fatal') guard = 0;
        guardUI();
        log('coach ' + d, tx(res.coach || coachTxt[d]));
        $('#cu').classList.toggle('shake', d === 'fatal'); if (d === 'fatal') setTimeout(() => $('#cu') && $('#cu').classList.remove('shake'), 600);
        if (guard <= 0) { cap.textContent = tx(res.scammer); log('them', tx(res.scammer)); return end('lose'); }
        if (safeN >= 3 || turns >= 8) { return end('win'); }
        await speakScammer(res.scammer); listen();
      }
      function end(outcome) {
        if (over && $('#cu').dataset.s === 'over') return; over = true; stopRec(); stopSpeech(); if (tick) clearInterval(tick);
        state('over'); acts(false); form.hidden = true;
        const s = st(), win = outcome !== 'lose';
        const xp = win ? (outcome === 'exit' ? 90 : 70 + Math.max(0, Math.round(guard / 4))) : 10;
        s.plays++; if (win) { s.wins++; s.voiceWins = (s.voiceWins || 0) + 1; award('first'); award('voice'); } if (outcome === 'exit') { s.exits++; if (s.exits >= 3) award('exit3'); } save(); addXP(xp);
        const box = document.createElement('div'); box.className = 'card result glow'; box.style.marginTop = '12px';
        box.innerHTML = `<div class="stamp ${win ? 'ok' : 'no'}">${win ? L('ফাঁদ ধরা পড়েছে', 'Trap spotted') : L('ফাঁদে পড়েছেন', 'Trapped')}</div><div class="big-ico">${win ? '🏆' : '😵'}</div><h2>${win ? L('আপনি টিকে গেছেন!', 'You held your ground!') : L('প্রতারক জিতে গেল', 'The scammer won')}</h2><p class="mut">${win ? L('চাপের মধ্যেও আপনি তথ্য বা টাকা দেননি।', 'Even under pressure you gave away no details or money.') : L('এখানে ভুল করলে ক্ষতি নেই। এটাই অনুশীলনের জায়গা।', 'Mistakes here cost nothing. This is the place to practise.')}</p><div><span class="xp">+${bn(xp)} XP</span></div>
          <div class="row" style="justify-content:center;margin-top:16px"><a class="btn pri" href="#/voice/${pid}" id="vagain">🔁 ${L('আবার', 'Again')}</a><a class="btn" href="#/voice">${L('অন্য কল', 'Another call')}</a><a class="btn" href="#/scan">🔎 ${L('স্ক্যান করুন', 'Scan a message')}</a></div>`;
        $('#cu').after(box); $('#trd').open = true;
        const ag = $('#vagain'); if (ag) ag.addEventListener('click', () => setTimeout(c.route, 0));
        box.scrollIntoView && box.scrollIntoView({ block: 'center' });
      }
      form.addEventListener('submit', (e) => { e.preventDefault(); const v = inp.value.trim(); if (!v) return; inp.value = ''; turn(v); });
      $('#answer').onclick = () => {
        if (started) return; started = true;
        tick = setInterval(() => { secs++; const t = $('#tm'); if (t) t.textContent = bn(String(Math.floor(secs / 60)).padStart(2, '0')) + ':' + bn(String(secs % 60).padStart(2, '0')); }, 1000);
        $('#tm').textContent = bn('00:00'); guardUI(); opening();
      };
      guardUI();
    };

    /* =========================================================
       ৯০ সেকেন্ডের ডেমো ট্যুর
    ========================================================= */
    let tour = null;
    async function until(sel, ms) { const t0 = Date.now(); while (Date.now() - t0 < (ms || 4000)) { const el = $(sel); if (el) return el; await new Promise((r) => setTimeout(r, 60)); } return null; }
    const clickText = async (sel, pred) => { await until(sel); const b = $$(sel).find(pred); if (b) b.click(); return !!b; };
    const sc0 = () => SG.SCENARIOS.find((s) => s.id === 'bkash-otp');
    const unq = (t) => t.replace(/^["“]+|["”]+$/g, '').trim();
    const pickKind = async (kind) => { const all = sc0().steps.reduce((a, x) => a.concat(x.choices), []); await until('#choices .ch'); const b = $$('#choices .ch').find((bt) => all.some((ch) => ch.k === kind && (bt.textContent.trim() === unq(ch.t) || bt.textContent.trim() === unq(tx(ch.t))))); if (b) b.click(); return !!b; };
    const STEPS = [
      { h: '#/home', sel: '.hero', bn: ['স্বাগতম, Scam Gym-এ', 'প্রতারকের মুখোমুখি হওয়ার আগে অনুশীলনের জিম। AI প্রতারক সেজে ফাঁদ পাতে, আপনি শেখেন কীভাবে ঠেকাতে হয়। কোনো টাকা বা তথ্য ঝুঁকিতে নেই।'], en: ['Welcome to Scam Gym', 'A training gym to practise before you meet a real scammer. AI plays the scammer, you learn to stop it. No money or data is ever at risk.'] },
      { h: '#/play/bkash-otp', sel: '#phone', bn: ['বাস্তব ধাঁচের সিমুলেশন', 'ভুয়া "বিকাশ কাস্টমার কেয়ার" কল। উপরের সুরক্ষা মিটারই আপনার প্রাণ। ভুল চালে মিটার কমে, টাকা নয়।'], en: ['Realistic simulations', 'A fake "bKash customer care" call. The safety meter is your life bar. Wrong moves cost meter, never money.'] },
      { h: '#/play/bkash-otp', sel: '.b.coach', act: async () => { await pickKind('risky'); await until('.b.coach'); }, bn: ['ভুল করলে কোচ বুঝিয়ে দেয়', 'ঝুঁকিপূর্ণ উত্তর দিলে কোচ সাথে সাথে বলে দেয় কেন এটা ফাঁদ, আর প্রতারক কোন কৌশল নিয়েছে।'], en: ['The coach explains your mistake', 'Pick a risky answer and the coach tells you why it is a trap and which tactic the scammer used.'] },
      { h: '#/play/bkash-otp', sel: '.b.coach.safe', act: async () => { await until('#nx'); const nx = $('#nx'); if (nx) nx.click(); await sleep(250); await pickKind('safe'); await until('.b.coach.safe', 2500); }, bn: ['সঠিক চাল: থামুন, যাচাই করুন', 'প্রত্যাখ্যান করে নিজে অফিসিয়াল হেল্পলাইনে যাচাই করাই নিরাপদ পথ। এভাবেই অভ্যাস তৈরি হয়।'], en: ['The right move: pause and verify', 'Refusing and checking with the official helpline yourself is the safe path. That is how the habit forms.'] },
      { h: '#/voice', sel: '.sc', bn: ['ভয়েস কল মোড', 'প্রতারক ফোনে কথা বলে, আপনি মুখে উত্তর দেন (বা টাইপ করেন)। চাপের মধ্যে ঠান্ডা থাকার প্রকৃত অনুশীলন।'], en: ['Voice call mode', 'The scammer speaks on a call and you answer out loud (or type). Real practice at staying calm under pressure.'] },
      { h: '#/scan', sel: '#out', act: async () => { await clickText('[data-s]', (b) => b.dataset.s === '2'); await until('#out .card, #out .gauge'); }, bn: ['স্ক্যানার: লাল পতাকা ধরুন', 'যেকোনো সন্দেহজনক মেসেজ দিন। কোন কৌশল, কোন লিংক ফাঁদ, সব হাইলাইট হয়ে দেখায়। বিশ্লেষণ আপনার ডিভাইসেই হয়।'], en: ['Scanner: catch the red flags', 'Paste any suspicious message. Tactics and trap links are highlighted. The analysis runs on your device.'] },
      { h: '#/lookalike', sel: '#lkout', act: async () => { const i = await until('#lk'); if (i) { i.value = 'bkas-h.com/bonus'; $('#lkgo').click(); } await until('#lkout .card'); }, bn: ['নকল লিংক, অক্ষর ধরে ধরা', 'bKash, ব্যাংক বা কুরিয়ারের নকল ঠিকানায় ঠিক কোন অক্ষর বদলানো হয়েছে, লাল দাগে দেখানো হয়।'], en: ['Fake links, caught letter by letter', 'Fake bKash, bank or courier addresses show exactly which letters were changed, marked in red.'] },
      { h: '#/alerts', sel: '.alert.glow', bn: ['প্রতি সপ্তাহে একটি নতুন ফাঁদ', 'প্রচলিত ফাঁদের সাপ্তাহিক ফোকাস। নমুনা বার্তা, চেনার উপায়, করণীয়, আর এক ক্লিকে স্ক্যান বা অনুশীলন।'], en: ['A new trap every week', 'A weekly focus on a common trap: sample message, how to spot it, what to do, and one tap to scan or practise.'] },
      { h: '#/secret', sel: '#wd', act: async () => { await until('#wgen'); $('#wgen').click(); }, bn: ['এআই-গলা নকলের বিরুদ্ধে সিক্রেট ওয়ার্ড', 'গলা শুনে আর ভরসা নেই। পরিবারের প্রত্যেকের জন্য গোপন শব্দ বানান, অগ্রগতি দেখুন, প্রতি ৩ মাসে বদলান।'], en: ['A secret word against AI voice cloning', 'A familiar voice is no longer proof. Make a private word per family member, track progress, change it every 3 months.'] },
      { h: '#/me', sel: 'svg[role="img"]', bn: ['আপনার দুর্বলতার রাডার', 'কোন কৌশলে আপনি বেশি ধরা খান অ্যাপ তা মনে রাখে এবং সেই অনুযায়ী পরের অনুশীলন সাজেস্ট করে।'], en: ['Your weakness radar', 'The app remembers which tactics catch you most often and suggests your next practice accordingly.'] },
      { h: '#/sos', sel: 'main .card', bn: ['ক্ষতি হয়ে গেলে: SOS', 'প্রথম ১৫ মিনিটে কী করবেন, কাকে ফোন করবেন, অভিযোগের ড্রাফটসহ ধাপে ধাপে গাইড।'], en: ['If it already happened: SOS', 'What to do in the first 15 minutes, whom to call, with a ready complaint draft, step by step.'] },
      { h: '#/home', sel: '.hero', bn: ['সবার জন্য, সবখানে', 'বাংলা ও ইংরেজি, বড় লেখার মোড, অফলাইনেও চলে (PWA), ফোনের হোম স্ক্রিনে ইনস্টল করা যায়। এখন নিজে খেলে দেখুন!'], en: ['For everyone, everywhere', 'Bangla and English, large-text mode, works offline (PWA) and installs on the phone home screen. Now try it yourself!'] }
    ];
    function spotlight() {
      let sp = $('#tspot'); if (!tour) { if (sp) sp.remove(); return; }
      if (!sp) { sp = document.createElement('div'); sp.id = 'tspot'; sp.setAttribute('aria-hidden', 'true'); document.body.appendChild(sp); }
      const el = tour.sel ? $(tour.sel) : null;
      if (!el) { sp.style.opacity = 0; return; }
      const r = el.getBoundingClientRect(); sp.style.opacity = 1;
      sp.style.cssText += `;top:${r.top - 8}px;left:${r.left - 8}px;width:${r.width + 16}px;height:${r.height + 16}px`;
    }
    function panel() {
      if (!tour) return; const s = STEPS[tour.i], en = c.lang() === 'en', t = en ? s.en : s.bn, last = tour.i === STEPS.length - 1;
      let p = $('#tour'); if (!p) { p = document.createElement('div'); p.id = 'tour'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Demo tour'); document.body.appendChild(p); }
      p.innerHTML = `<div class="t-bar"><i id="tr-prog" style="width:${Math.round(((tour.i + 1) / STEPS.length) * 100)}%"></i></div>
        <div class="t-in"><div class="row sp"><span class="pill acc">${L('ডেমো', 'Demo')} ${bn(tour.i + 1)}/${bn(STEPS.length)}</span><button class="btn sm ghost" id="tr-x" aria-label="${L('বন্ধ করুন', 'Close tour')}">✕ ${L('বন্ধ', 'Exit')}</button></div>
        <h3>${esc(t[0])}</h3><p>${esc(t[1])}</p>
        <div class="row"><button class="btn sm" id="tr-p" ${tour.i === 0 ? 'disabled' : ''}>‹ ${L('আগের', 'Back')}</button><button class="btn sm" id="tr-a">${tour.auto ? '⏸ ' + L('থামান', 'Pause') : '▶ ' + L('চালান', 'Auto')}</button><button class="btn sm pri" id="tr-n">${last ? L('খেলা শুরু করুন', 'Start playing') : L('পরের', 'Next') + ' ›'}</button></div></div>`;
      $('#tr-x').onclick = () => endTour(false); $('#tr-p').onclick = () => goto(tour.i - 1); $('#tr-n').onclick = () => (last ? endTour(true) : goto(tour.i + 1));
      $('#tr-a').onclick = () => { tour.auto = !tour.auto; schedule(); panel(); };
    }
    function schedule() { if (!tour) return; clearTimeout(tour.tm); if (tour.auto) tour.tm = setTimeout(() => { if (tour && tour.i < STEPS.length - 1) goto(tour.i + 1); else if (tour) { tour.auto = false; panel(); } }, FAST ? 0 : 7500); }
    async function goto(i) {
      if (!tour || i < 0 || i >= STEPS.length) return; const my = ++tour.run; clearTimeout(tour.tm);
      tour.i = i; const s = STEPS[i]; tour.sel = s.sel; panel(); const sp = $('#tspot'); if (sp) sp.style.opacity = 0;
      if (location.hash !== s.h) { location.hash = s.h; await new Promise((r) => setTimeout(r, FAST ? 30 : 380)); } else if (i > 0 && STEPS[i - 1].h !== s.h) { /* same page */ }
      if (!tour || my !== tour.run) return;
      if (s.act) { try { await s.act(); } catch (e) { console.error(e); } }
      if (!tour || my !== tour.run) return;
      const el = tour.sel ? await until(tour.sel, 1500) : null;
      if (el && !FAST) { const r = el.getBoundingClientRect(); if (r.top > 220 || r.top < 70) window.scrollBy({ top: r.top - 110, behavior: 'smooth' }); }
      await sleep(350); spotlight(); schedule();
    }
    function startTour() {
      if (tour) return;
      tour = { i: 0, auto: true, run: 0, tm: null, sel: null, snap: JSON.parse(JSON.stringify(c.S)), iv: setInterval(spotlight, 250) };
      document.body.classList.add('touring');
      tour.lb = () => setTimeout(panel, 80); const lb = $('#langBtn'); if (lb) lb.addEventListener('click', tour.lb);
      goto(0);
    }
    function endTour(finished) {
      if (!tour) return; const t = tour; tour = null; clearTimeout(t.tm); clearInterval(t.iv);
      const lb = $('#langBtn'); if (lb) lb.removeEventListener('click', t.lb);
      const p = $('#tour'); if (p) p.remove(); const sp = $('#tspot'); if (sp) sp.remove(); document.body.classList.remove('touring');
      c.restoreS(t.snap);
      if (finished) { award('tour'); toast(L('শুরু করুন! আজকের চ্যালেঞ্জ হোমে অপেক্ষা করছে 🎯', 'Go! Today\'s challenge is waiting on Home 🎯')); }
      if (location.hash !== '#/arena' && finished) location.hash = '#/arena'; else c.route();
    }
    VIEWS.tour = function () { location.replace('#/home'); setTimeout(startTour, FAST ? 0 : 120); };
    window.SG.startTour = startTour;
    try { if (/[?&]tour=1/.test(location.search)) setTimeout(startTour, FAST ? 0 : 900); } catch (e) { /* ignore */ }
  });
})();
