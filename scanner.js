/* Scam Gym — অফলাইন স্ক্যাম ডিটেক্টর (নিয়ম-ভিত্তিক, বাংলা + ইংরেজি) */
(function () {
  const G = typeof window !== 'undefined' ? window : globalThis;
  const SG = (G.SG = G.SG || {});

  const BN2EN = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  const norm = (s) => s.replace(/[০-৯]/g, (d) => BN2EN[d]).toLowerCase();

  // id, label, tactic, weight, regex, why
  const RULES = [
    { id: 'otp', label: 'OTP / পিন / পাসওয়ার্ড চাওয়া', tactic: 'authority', w: 38,
      re: /(otp|ওটিপি|পিন|pin\b|পাসওয়ার্ড|password|কোড|code)[^\n।.!?]{0,28}(বলুন|বলেন|বলো|দিন|দেন|দাও|পাঠান|পাঠাও|শেয়ার করুন|জানান|send|share|tell|give|provide|enter)|(বলুন|দিন|দেন|পাঠান|share|send|give|tell|provide)[^\n।.!?]{0,22}(otp|ওটিপি|পিন|pin\b|পাসওয়ার্ড|password|ভেরিফিকেশন কোড|verification code)/gi,
      why: 'আসল ব্যাংক বা মোবাইল ব্যাংকিং সেবা কখনো ফোন বা মেসেজে OTP/পিন চায় না।' },
    { id: 'urgency', label: 'তাড়াহুড়োর চাপ', tactic: 'urgency', w: 13,
      re: /(এখনই|এক্ষুনি|এখন না করলে|২৪ ঘণ্টা|২ ঘণ্টা|১০ মিনিট|24 ঘণ্টা|জরুরি|অবিলম্বে|সময় শেষ|শেষ সুযোগ|আজই|urgent|immediately|right now|within \d+ ?(hours?|minutes?|hrs?|mins?)|last chance|act now|expires?)/gi,
      why: 'ভাবার সুযোগ না দেওয়াই প্রতারণার প্রধান কৌশল।' },
    { id: 'threat', label: 'ভয় / হুমকি', tactic: 'fear', w: 20,
      re: /(বন্ধ হয়ে যাবে|বন্ধ হবে|ব্লক হয়ে|ব্লক হবে|সাসপেন্ড|মামলা|গ্রেপ্তার|গ্রেফতার|জরিমানা|আইনি ব্যবস্থা|ফ্রিজ|blocked|suspend(ed)?|arrest|legal action|deactivat|will be (closed|terminated))/gi,
      why: 'অ্যাকাউন্ট বন্ধ বা মামলার ভয় দেখিয়ে সঠিক সিদ্ধান্ত নেওয়ার ক্ষমতা কমানো হয়।' },
    { id: 'prize', label: 'পুরস্কার / লটারির টোপ', tactic: 'greed', w: 24,
      re: /(জিতেছেন|জিতে নিয়েছেন|লাকি ড্র|লটারি|পুরস্কার|গিফট|উপহার|বোনাস|কংগ্রাচুলেশন|অভিনন্দন|congratulations|you (have )?won|lucky draw|lottery|prize|free gift|selected)/gi,
      why: 'যে ড্রতে অংশ নেননি, সেখানে জেতা সম্ভব নয়।' },
    { id: 'fee', label: 'অগ্রিম ফি / চার্জ', tactic: 'fee', w: 28,
      re: /(রেজিস্ট্রেশন ফি|প্রসেসিং ফি|ট্যাক্স|কাস্টমস ফি|ডেলিভারি চার্জ|ডেলিভারি ফি|অগ্রিম|সিকিউরিটি ডিপোজিট|ফি দিন|ফি পরিশোধ|ফি জমা|processing fee|registration fee|advance (payment|fee)|customs fee|pay (a |the )?fee|delivery (fee|charge))/gi,
      why: 'চাকরি, পুরস্কার বা পার্সেলের জন্য আগে টাকা চাওয়া স্ক্যামের ক্লাসিক লক্ষণ।' },
    { id: 'secrecy', label: 'গোপনীয়তার চাপ', tactic: 'secrecy', w: 20,
      re: /(কাউকে (বলবেন না|বলো না|জানাবেন না|জানিও না)|গোপন রাখুন|গোপনে|কারো সাথে আলোচনা করবেন না|do not tell|don'?t tell|keep (this )?(a )?secret|confidential)/gi,
      why: 'অন্যের পরামর্শ থেকে আপনাকে আলাদা করার জন্যই "কাউকে বলবেন না" বলা হয়।' },
    { id: 'moneyask', label: 'টাকা পাঠানোর অনুরোধ', tactic: 'fee', w: 22,
      re: /(সেন্ড মানি|send money|ক্যাশ ?আউট|cash ?out|বিকাশ করুন|বিকাশ করে দা|নগদে পাঠান|নগদ করে দা|রিচার্জ করে দিন|টাকা পাঠিয়ে দ|টাকা পাঠান|পাঠিয়ে দেবেন|পাঠিয়ে দাও|ট্রান্সফার করুন|পার্সোনাল (নম্বরে|নাম্বারে))/gi,
      why: 'অচেনা বা অযাচাইকৃত নম্বরে টাকা চাওয়া সবচেয়ে বড় লাল পতাকা।' },
    { id: 'remote', label: 'রিমোট অ্যাপ / APK ইনস্টল', tactic: 'remote', w: 34,
      re: /(anydesk|এনিডেস্ক|teamviewer|টিমভিউয়ার|quicksupport|রিমোট|\.apk|apk ফাইল|অ্যাপ ইনস্টল|ইনস্টল করুন|app ইনস্টল|install (the |this )?app|download (the |this )?app)/gi,
      why: 'রিমোট অ্যাপ ইনস্টল করালে প্রতারক ফোনের স্ক্রিন ও OTP দেখে টাকা সরাতে পারে।' },
    { id: 'toogood', label: 'অবাস্তব আয় / লাভের প্রলোভন', tactic: 'greed', w: 18,
      re: /(ঘরে বসে|প্রতিদিন [0-9,]+ ?টাকা|মাসে [0-9,]+ ?টাকা|দ্বিগুণ|ডাবল|নিশ্চিত লাভ|লাভের গ্যারান্টি|গ্যারান্টি|কোনো অভিজ্ঞতা লাগবে না|guaranteed (profit|return)|double your|earn \$?\d+ ?(daily|per day|a day)|no experience)/gi,
      why: 'নিশ্চিত বা অস্বাভাবিক আয়ের প্রতিশ্রুতি বাস্তবে প্রায় কখনো সত্য নয়।' },
    { id: 'viral', label: '"ফ্রি + শেয়ার/ক্লিক" টোপ', tactic: 'greed', w: 26,
      re: /(ফ্রি (ইন্টারনেট|জিবি|মিনিট|রিচার্জ|ডাটা|ডেটা)|[0-9]+ ?(টি |টা )?গ্রুপে শেয়ার|শেয়ার করুন[^।\n]{0,28}(লিংক|ক্লিক)|ক্লিক করে (মোবাইল )?(নম্বর|নাম্বার|তথ্য)|free (internet|data|recharge|gb))/gi,
      why: 'ফ্রি অফারের নামে শেয়ার ও তথ্য সংগ্রহ — ফিশিং ও ডেটা চুরির জনপ্রিয় ছক।' },
    { id: 'newnum', label: '"নতুন নম্বর / ফোন হারিয়েছে" চাল', tactic: 'trust', w: 22,
      re: /(নতুন (নম্বর|নাম্বার)|ফোন হারিয়ে|ফোন নষ্ট|ফোন হারিয়েছি|এটা আমার নতুন|my new number|lost my phone|new number)/gi,
      why: 'আপনজন সেজে টাকা চাওয়ার এই চাল খুব প্রচলিত।' },
    { id: 'wrong', label: '"ভুল করে পাঠিয়েছি, ফেরত দিন"', tactic: 'trust', w: 24,
      re: /(ভুল করে[^\n।]{0,18}(পাঠ|সেন্ড)|ভুলে[^\n।]{0,14}পাঠ|টাকাটা ফেরত দিন|ফেরত দিন)/gi,
      why: 'ভুল ট্রান্সফারের নামে ফেরত নেওয়ার চাপ — আগে অপারেটরের মাধ্যমে যাচাই করুন।' },
    { id: 'kyc', label: 'KYC / ভেরিফাই / আপডেটের চাপ', tactic: 'authority', w: 16,
      re: /(kyc|কেওয়াইসি|আপডেট করুন|ভেরিফাই করুন|যাচাই করুন|verify your|update your (account|kyc|details)|account (will be|has been) (closed|blocked|suspended|locked))/gi,
      why: 'KYC/ভেরিফিকেশনের নামে লিংক ও তথ্য চাওয়া ফিশিংয়ের সাধারণ ছক।' },
    { id: 'pii', label: 'ব্যক্তিগত তথ্য চাওয়া (NID/কার্ড)', tactic: 'authority', w: 20,
      re: /(এনআইডি|nid|জাতীয় পরিচয়|পাসপোর্ট|কার্ড নম্বর|card number|cvv|ব্যাংক অ্যাকাউন্ট নম্বর|জন্ম তারিখ)[^\n।]{0,24}(দিন|বলুন|পাঠান|send|share|provide|enter|দাও|বলো)|(দিন|বলুন|পাঠান|send|share|provide|enter)[^\n।]{0,20}(এনআইডি|nid|জাতীয় পরিচয়|পাসপোর্ট|কার্ড নম্বর|card number|cvv)/gi,
      why: 'NID/কার্ডের তথ্য দিয়ে পরিচয় চুরি ও আর্থিক ক্ষতি হতে পারে।' },
    { id: 'channel', label: 'অন্য অ্যাপে (হোয়াটসঅ্যাপ/টেলিগ্রাম) নিয়ে যাওয়া', tactic: 'trust', w: 7,
      re: /(হোয়াটসঅ্যাপ|whatsapp|টেলিগ্রাম|telegram|ইনবক্সে|ইনবক্স করুন)/gi,
      why: 'নজর এড়াতে আলাপ অন্য চ্যানেলে সরানো হয়।' },
    { id: 'authority', label: 'সংস্থা সেজে পরিচয়', tactic: 'authority', w: 7,
      re: /(হেড অফিস|কাস্টমার কেয়ার|কাস্টমার সার্ভিস|btrc|বিটিআরসি|সিআইডি|\bcid\b|পুলিশ|থানা|কাস্টমস|customer care|head office|police)/gi,
      why: 'প্রতিষ্ঠান বা কর্তৃপক্ষের নাম ব্যবহার করে বিশ্বাস আদায়।' }
  ];

  // OTP বার্তার সতর্কীকরণ (আসল বার্তায় থাকে)
  const OTP_WARN = /(কাউকে দেবেন না|কাউকে (বলবেন না|শেয়ার)|শেয়ার করবেন না|do not share|never share|don'?t share|কখনো (otp|ওটিপি|পিন) চায় না|কারো সাথে শেয়ার)/i;

  const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'cutt.ly', 'rb.gy', 'is.gd', 'shorturl.at', 'goo.gl', 'ow.ly', 'tiny.cc', 'bit.do', 'rebrand.ly'];
  const BAD_TLDS = ['xyz', 'top', 'click', 'icu', 'buzz', 'monster', 'cfd', 'sbs', 'rest', 'gq', 'tk', 'ml', 'cf', 'ga', 'work', 'loan', 'zip', 'mov', 'link', 'live', 'fit', 'vip', 'win'];
  const BRANDS = ['bkash', 'nagad', 'rocket', 'upay', 'dutchbangla', 'dbbl', 'bracbank', 'grameenphone', 'robi', 'banglalink', 'airtel', 'pathao', 'daraz', 'foodpanda', 'facebook', 'google', 'paypal', 'whatsapp', 'bkashapp', 'islamibank', 'sonalibank', 'janatabank', 'agranibank', 'nid', 'bangladesh'];
  const OFFICIAL = ['bkash.com', 'bka.sh', 'nagad.com.bd', 'dutchbanglabank.com', 'dbbl.com.bd', 'bracbank.com', 'grameenphone.com', 'robi.com.bd', 'banglalink.net', 'airtel.com.bd', 'daraz.com.bd', 'pathao.com', 'facebook.com', 'fb.com', 'google.com', 'paypal.com', 'whatsapp.com', 'islamibankbd.com', 'sonalibank.com.bd', 'janatabank-bd.com', 'agranibank.org', 'nidw.gov.bd', 'bangladesh.gov.bd'];
  const MULTI_TLD = ['com.bd', 'gov.bd', 'org.bd', 'net.bd', 'edu.bd', 'co.uk', 'com.au'];

  function regDomain(host) {
    const parts = host.split('.');
    if (parts.length <= 2) return host;
    const last2 = parts.slice(-2).join('.');
    if (MULTI_TLD.includes(last2)) return parts.slice(-3).join('.');
    return last2;
  }
  function leet(s) { return s.replace(/0/g, 'o').replace(/1/g, 'l').replace(/3/g, 'e').replace(/5/g, 's').replace(/rn/g, 'm').replace(/vv/g, 'w'); }

  function lev(a, b) {
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }

  function analyzeUrl(raw) {
    const out = { url: raw, host: '', flags: [], risk: 0, official: false };
    let u = raw.replace(/\[\.\]/g, '.').replace(/[),.;!?'"]+$/, '');
    const hasProto = /^https?:\/\//i.test(u);
    let host = '', path = '';
    try {
      const url = new URL(hasProto ? u : 'http://' + u);
      host = url.hostname.toLowerCase(); path = (url.pathname + url.search).toLowerCase();
      if (url.username || /@/.test(u.split('/')[2] || '')) { out.flags.push({ t: 'ঠিকানায় "@" চিহ্ন — আসল গন্তব্য লুকানোর কৌশল', w: 30 }); }
    } catch (e) { return null; }
    out.host = host;
    const reg = regDomain(host);
    if (OFFICIAL.includes(reg)) { out.official = true; }
    if (SHORTENERS.includes(reg)) out.flags.push({ t: 'শর্ট লিংক — আসল গন্তব্য দেখা যায় না', w: 24 });
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) out.flags.push({ t: 'ডোমেইনের বদলে আইপি অ্যাড্রেস', w: 30 });
    if (host.includes('xn--')) out.flags.push({ t: 'পিউনিকোড (দেখতে একরকম, আসলে ভিন্ন) ডোমেইন', w: 30 });
    const tld = host.split('.').pop();
    if (BAD_TLDS.includes(tld) && !out.official) out.flags.push({ t: `সন্দেহজনক ডোমেইন-প্রান্ত (.${tld})`, w: 18 });
    if (!out.official) {
      const label = reg.split('.')[0];
      const hostLeet = leet(host.replace(/[-_.]/g, ''));
      let hit = null;
      for (const b of BRANDS) {
        if (hostLeet.includes(b) || host.replace(/[-_.]/g, '').includes(b)) { hit = b; break; }
        if (b.length >= 5 && lev(leet(label), b) <= 1) { hit = b; break; }
      }
      if (hit) out.flags.push({ t: `"${hit}" নামের নকল-সদৃশ ঠিকানা — অফিসিয়াল সাইট নয়`, w: 42 });
    }
    if ((host.match(/-/g) || []).length >= 3 || host.length > 32) out.flags.push({ t: 'অতিরিক্ত লম্বা/হাইফেনযুক্ত ঠিকানা', w: 12 });
    if (host.split('.').length >= 5) out.flags.push({ t: 'অনেকগুলো সাবডোমেইন', w: 10 });
    if (/^http:\/\//i.test(u)) out.flags.push({ t: 'নিরাপত্তাহীন সংযোগ (http)', w: 8 });
    if (/(login|verify|update|claim|prize|bonus|kyc|secure|signin|reward|gift)/.test(path + host) && !out.official) out.flags.push({ t: 'লগইন/ক্লেইম/ভেরিফাই ধরনের শব্দ', w: 10 });
    out.risk = out.flags.reduce((s, f) => s + f.w, 0);
    return out;
  }

  function extractUrls(text) {
    const re = /((?:https?:\/\/)?(?:[a-z0-9-]+(?:\[\.\]|\.))+[a-z]{2,}(?::\d+)?(?:\/[^\s<>"'।]*)?)/gi;
    const found = []; let m;
    while ((m = re.exec(text))) {
      const s = m[1];
      if (/^\d+(\.\d+)*$/.test(s)) continue;
      if (/@/.test(text.slice(Math.max(0, m.index - 1), m.index))) continue; // ইমেইল
      if (/^[a-z]\.[a-z]$/i.test(s)) continue;
      found.push({ s: m.index, e: m.index + s.length, raw: s });
    }
    return found;
  }

  function phoneAsks(t) {
    // বাংলাদেশি মোবাইল নম্বর + টাকা পাঠানোর প্রসঙ্গ
    return /01[3-9]\d{8}/.test(t.replace(/[-\s]/g, ''));
  }

  function analyze(text) {
    text = String(text || '').slice(0, 5000);
    const t = norm(text);
    const base = t.length === text.length ? t : text; // নিরাপত্তা: দৈর্ঘ্য বদলালে অরিজিনাল
    const hits = []; const found = {}; const tactics = {}; let sum = 0; const rules = [];

    for (const r of RULES) {
      r.re.lastIndex = 0; let m; const hs = []; let guard = 0;
      while ((m = r.re.exec(base)) && guard++ < 20) {
        if (m[0].length === 0) { r.re.lastIndex++; continue; }
        hs.push({ s: m.index, e: m.index + m[0].length, txt: text.slice(m.index, m.index + m[0].length), rule: r.id });
      }
      if (hs.length) {
        found[r.id] = true; hits.push(...hs);
        sum += r.w + Math.min(hs.length - 1, 2) * 2;
        tactics[r.tactic] = (tactics[r.tactic] || 0) + hs.length;
        rules.push({ id: r.id, label: r.label, tactic: r.tactic, w: r.w, why: r.why, count: hs.length, samples: hs.slice(0, 3).map((h) => h.txt) });
      }
    }

    // লিংক
    const urlHits = extractUrls(text); const links = [];
    for (const u of urlHits) {
      const a = analyzeUrl(u.raw);
      if (!a) continue;
      links.push(a);
      if (a.risk > 0 || !a.official) hits.push({ s: u.s, e: u.e, txt: u.raw, rule: 'link' });
      sum += Math.min(a.risk, 60) * 0.9;
      if (a.risk >= 40) tactics.authority = (tactics.authority || 0) + 1;
    }
    if (urlHits.length && !links.some((l) => l.risk > 0) && links.length) { /* অফিসিয়াল লিংক — নরম */ }

    // মোবাইল নম্বর + পাঠানোর অনুরোধ
    if (phoneAsks(base) && (found.moneyask || found.fee)) { sum += 8; }

    // সংমিশ্রণ বোনাস
    const bonus = [];
    if ((found.prize || found.toogood) && (found.fee || found.moneyask)) { sum += 16; bonus.push('লোভ + অগ্রিম টাকা — সবচেয়ে বিপজ্জনক সংমিশ্রণ'); }
    if (found.authority && (found.otp || found.threat || found.urgency)) { sum += 10; bonus.push('কর্তৃপক্ষের ভান + চাপ — প্রতারণার ক্লাসিক ছক'); }
    if (found.newnum && found.moneyask) { sum += 14; bonus.push('নতুন নম্বর + টাকা চাওয়া — পরিচিত সেজে প্রতারণা'); }
    if (found.otp && found.urgency) { sum += 8; }
    if ((text.match(/!/g) || []).length >= 3 || /[🎉🎊💰🔥🎁]/.test(text)) { sum += 5; }

    const notes = [];
    // আসল OTP-সতর্কবার্তা ধরনের টেক্সট
    const looksOtpNotice = OTP_WARN.test(text) && !found.threat && !found.fee && !found.prize && !links.some((l) => l.risk > 0);
    if (looksOtpNotice) {
      sum = Math.min(sum, 8);
      notes.push('এটি দেখতে একটি আসল ওটিপি-সতর্কবার্তার মতো। তবে মনে রাখবেন: এই কোড কেউ ফোনে বা মেসেজে চাইলে সেটাই স্ক্যাম।');
    }
    // OTP রুল ট্রিগার হলেও আসল সতর্কবার্তা হলে বাদ দিন
    const finalRules = looksOtpNotice ? rules.filter((r) => r.id !== 'otp') : rules;

    const score = Math.round(100 * (1 - Math.exp(-sum / 48)));
    let level, key, emoji;
    if (score < 15) { level = 'বড় কোনো লাল পতাকা পাওয়া যায়নি'; key = 'low'; emoji = '🟢'; }
    else if (score < 40) { level = 'সামান্য সন্দেহজনক'; key = 'mid'; emoji = '🟡'; }
    else if (score < 70) { level = 'সন্দেহজনক — সাবধান'; key = 'high'; emoji = '🟠'; }
    else { level = 'উচ্চ ঝুঁকি — প্রায় নিশ্চিত স্ক্যাম'; key = 'critical'; emoji = '🔴'; }

    // হাইলাইট রেঞ্জ মার্জ
    hits.sort((a, b) => a.s - b.s || b.e - a.e);
    const merged = [];
    for (const h of hits) {
      const last = merged[merged.length - 1];
      if (last && h.s <= last.e) { last.e = Math.max(last.e, h.e); last.rules.add(h.rule); }
      else merged.push({ s: h.s, e: h.e, rules: new Set([h.rule]) });
    }

    // পরামর্শ
    const advice = [];
    const add = (s) => { if (!advice.includes(s)) advice.push(s); };
    if (score >= 15) add('থামুন — উত্তর দেবেন না, লিংকে ক্লিক করবেন না, টাকা পাঠাবেন না।');
    if (found.otp && !looksOtpNotice) add('OTP, পিন বা পাসওয়ার্ড কাউকে দেবেন না — আসল প্রতিষ্ঠান কখনো চায় না।');
    if (found.fee || found.moneyask || found.prize) add('চাকরি, পুরস্কার বা পার্সেলের জন্য আগে টাকা দিতে হলে সেটাই স্ক্যাম।');
    if (links.some((l) => l.risk > 0)) add('লিংক খুলবেন না। খুলে ফেললে কোনো তথ্য লিখবেন না এবং ব্রাউজার বন্ধ করুন।');
    if (found.remote) add('রিমোট অ্যাপ (AnyDesk/TeamViewer) বা APK ইনস্টল করবেন না। করে ফেললে এখনই আনইনস্টল ও ইন্টারনেট বন্ধ করে ব্যাংককে জানান।');
    if (found.newnum || found.wrong) add('আপনজন দাবি করলে পুরোনো নম্বরে কল দিন বা ভিডিও কলে নিশ্চিত হোন; ফ্যামিলি কোডওয়ার্ড জিজ্ঞেস করুন।');
    if (found.threat || found.authority) add('কল বা বার্তার নম্বরে নয় — নিজে অফিসিয়াল হেল্পলাইনে ফোন করে যাচাই করুন।');
    if (score >= 40) add('স্ক্রিনশট রেখে নম্বরটি রিপোর্ট ও ব্লক করুন। ক্ষতি হয়ে গেলে "SOS" পেজ খুলুন।');
    if (score < 15 && !looksOtpNotice) add('বড় কোনো সংকেত নেই — তবু কোনো অনুরোধ (টাকা/তথ্য) এলে নিজে অন্য পথে যাচাই করুন। এটি নিরাপত্তার নিশ্চয়তা নয়।');

    return { score, level, key, emoji, rules: finalRules, links, tactics, notes, bonus, advice, ranges: merged.map((m) => ({ s: m.s, e: m.e, rules: [...m.rules] })), text };
  }

  // হাইলাইট করা সেফ HTML
  function highlight(text, ranges, esc) {
    let out = '', i = 0;
    for (const r of ranges) {
      if (r.s < i) continue;
      out += esc(text.slice(i, r.s));
      out += `<mark class="flag ${r.rules.includes('link') ? 'lnk' : ''}" title="${esc(r.rules.join(', '))}">${esc(text.slice(r.s, r.e))}</mark>`;
      i = r.e;
    }
    return out + esc(text.slice(i));
  }

  // অফলাইন লাইভ-সিম চালকের উত্তর বিচার (AI না থাকলে)
  function judgeReply(text) {
    const t = norm(text || '');
    const neg = /(না\b|নাই|নেই|কখনো|কক্ষনো|পারব না|দেব না|দিব না|দেবো না|বলব না|পাঠাব না|করব না)/;
    const safeRe = /(দেব না|দিব না|দেবো না|বলব না|দেবনা|কল কেটে|ব্লক|রিপোর্ট|যাচাই|বিশ্বাস করি না|স্ক্যাম|প্রতারণা|প্রতারক|থানা|1624[7]|16167|999|ভিডিও কল|কোডওয়ার্ড|পরিবারকে|জিজ্ঞেস করে|অফিসিয়াল|আপনি কে|পরিচয়)/;
    const codeLike = /\b\d{4,6}\b/.test(t);
    const fatalVerb = /(পাঠাচ্ছি|পাঠালাম|পাঠিয়ে দিচ্ছি|পাঠিয়ে দিলাম|ইনস্টল করছি|বলছি|দিচ্ছি|দিয়ে দিচ্ছি|ঠিক আছে.{0,12}(দিই|দেই|দিচ্ছি))/;
    if (codeLike && !neg.test(t)) return 'fatal';
    if (fatalVerb.test(t) && !neg.test(t)) return 'fatal';
    if (safeRe.test(t)) return 'safe';
    if (neg.test(t) && t.length > 6) return 'safe';
    return 'risky';
  }

  SG.scanner = { analyze, highlight, analyzeUrl, extractUrls, judgeReply, RULES };
})();
