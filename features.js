/* Scam Gym — নতুন ফিচার (১): লুক-অ্যালাইক লিংক ডিটেক্টর, সাপ্তাহিক অ্যালার্ট, সিক্রেট ওয়ার্ড প্ল্যান
   বাংলা/ইংরেজি দুটোই এখানে সরাসরি L(bn, en) দিয়ে লেখা। */
(function () {
  'use strict';
  const SG = window.SG;
  SG.exts = SG.exts || [];
  SG.extend = function (ctx) { SG.exts.forEach((f) => { try { f(ctx); } catch (e) { console.error(e); } }); };

  /* নতুন ব্যাজ */
  const NB = [
    { id: 'voice', i: '🎙️', n: 'ফোনযোদ্ধা', d: 'ভয়েস কল সিমুলেশনে জিতুন', en: ['Call fighter', 'Win a voice call simulation'] },
    { id: 'lookalike', i: '🕸️', n: 'চোখ-পাকা', d: 'নকল ঠিকানা চেনার ড্রিলে ৫/৫ পান', en: ['Sharp eye', 'Score 5/5 in the look-alike drill'] },
    { id: 'secret', i: '🗝️', n: 'গোপন-প্রহরী', d: 'পরিবারের একজনের সাথে সিক্রেট ওয়ার্ড চালু করুন', en: ['Word keeper', 'Set up a secret word with one family member'] },
    { id: 'alert', i: '📣', n: 'সজাগ-পাঠক', d: '৩টি সাপ্তাহিক অ্যালার্ট পড়ুন', en: ['Alert reader', 'Read 3 weekly alerts'] },
    { id: 'tour', i: '▶️', n: 'পুরো-দেখা', d: 'ডেমো ট্যুর শেষ পর্যন্ত দেখুন', en: ['Full tour', 'Watch the demo tour to the end'] }
  ];
  SG.EN_EXACT = SG.EN_EXACT || {};
  SG.EN_SUB = SG.EN_SUB || {};
  NB.forEach((b) => { SG.EN_SUB[b.n] = b.en[0]; });
  [['ভয়েস কল', 'Voice call'], ['লিংক ডিটেক্টর', 'Link detector'], ['সাপ্তাহিক অ্যালার্ট', 'Weekly alert'], ['সিক্রেট ওয়ার্ড', 'Secret word'], ['ডেমো ট্যুর', 'Demo tour']].forEach((x) => { SG.EN_EXACT[x[0]] = x[1]; });
  SG.EN_PAT = SG.EN_PAT || [];
  SG.EN_PAT.push(['"([^"]+)" নামের নকল-সদৃশ ঠিকানা — অফিসিয়াল সাইট নয়', '"$1" look-alike address, not the official site']);
  NB.forEach((b) => { SG.BADGES.push({ id: b.id, i: b.i, n: b.n, d: b.d }); SG.EN_EXACT[b.n] = b.en[0]; SG.EN_EXACT[b.d] = b.en[1]; });

  /* =============== সাপ্তাহিক অ্যালার্টের ডেটা =============== */
  const ALERTS = [
    { id: 'wrong-transfer', ico: '🔁', tac: ['urgency', 'trust'], scen: 'bkash-otp',
      bn: { t: '"ভুল করে টাকা পাঠিয়েছি, ফেরত দিন"', w: 'অচেনা নম্বর থেকে ফোন বা মেসেজ আসে: "ভুলে আপনার নম্বরে টাকা চলে গেছে, দয়া করে ফেরত দিন।" অনেক সময় আসলে কোনো টাকা আসেইনি, অথচ আপনি নিজের টাকা পাঠিয়ে ফেলেন।',
        s: ['আপনি কোনো টাকা পাওয়ার বার্তা দেখেননি, অথচ ফেরত চাওয়া হচ্ছে', 'তাড়া দেওয়া হচ্ছে: "এখনই", "খুব জরুরি"', 'ফেরত চাওয়া হচ্ছে অন্য একটি নম্বরে'],
        d: ['আগে নিজের অ্যাপে ব্যালান্স ও লেনদেনের তালিকা দেখুন', 'টাকা সত্যিই এসে থাকলে হেল্পলাইনে জানিয়ে তাদের মাধ্যমে ফেরত করুন', 'নম্বর ব্লক করে স্ক্রিনশট রাখুন'],
        x: 'ভাই, ভুল করে আপনার বিকাশে ৩,০০০ টাকা চলে গেছে। দয়া করে এখনই 01712345678 নম্বরে ফেরত পাঠান, খুব জরুরি!' },
      en: { t: '"I sent money to you by mistake, please return it"', w: 'A stranger calls or texts: "I sent money to your number by mistake, please send it back." Often no money arrived at all, yet you end up sending your own.',
        s: ['You never saw a "money received" message', 'You are pushed to act "right now"', 'The refund is requested to a different number'],
        d: ['Check your own balance and transaction list first', 'If money really arrived, report it to the helpline and return it through them', 'Block the number and keep a screenshot'],
        x: 'Brother, I sent 3,000 taka to your bKash by mistake. Please send it back right now to 01712345678, very urgent!' } },
    { id: 'parcel-link', ico: '🚚', tac: ['urgency', 'authority'], scen: 'fake-delivery',
      bn: { t: 'পার্সেল আটকে আছে, লিংকে ঠিকানা দিন', w: 'কুরিয়ারের নামে SMS: "আপনার পার্সেল আটকে আছে, ঠিকানা আপডেট করুন" এবং একটি লিংক। লিংকের ফর্মে কার্ড বা মোবাইল ব্যাংকিংয়ের তথ্য চাওয়া হয়।',
        s: ['কিছু অর্ডার না করলেও পার্সেলের বার্তা', 'কুরিয়ারের নামের সাথে মেলে না এমন লিংক', 'ডেলিভারি ফির জন্য কার্ডের তথ্য চাওয়া'],
        d: ['লিংকে ক্লিক করবেন না, কুরিয়ারের অফিসিয়াল অ্যাপ বা নম্বরে নিজে যাচাই করুন', 'অর্ডারের তালিকা দেখুন', 'লিংক খুলে ফেললে কিছু লিখবেন না'],
        x: 'আপনার পার্সেলটি ঠিকানা ভুলের কারণে আটকে আছে। ২৪ ঘণ্টার মধ্যে ঠিকানা আপডেট করুন: http://courier-bd-track.xyz/update' },
      en: { t: 'Parcel on hold, enter your address on the link', w: 'An SMS in a courier\'s name: "Your parcel is held, update your address" with a link. The form asks for card or mobile-banking details.',
        s: ['A parcel message when you ordered nothing', 'A link that does not match the courier\'s name', 'Card details requested for a delivery fee'],
        d: ['Do not tap the link; check in the courier\'s official app or number yourself', 'Look at your own order list', 'If you opened it, enter nothing'],
        x: 'Your parcel is held because of an address error. Update your address within 24 hours: http://courier-bd-track.xyz/update' } },
    { id: 'hacked-friend', ico: '👥', tac: ['trust', 'emotion'], scen: 'hacked-friend',
      bn: { t: 'বন্ধুর হ্যাক হওয়া অ্যাকাউন্ট থেকে টাকা চাওয়া', w: 'মেসেঞ্জার বা হোয়াটসঅ্যাপে পরিচিত কেউ জরুরি টাকা বা "একটা কোড" চায়। আসলে অ্যাকাউন্টটা প্রতারকের হাতে।',
        s: ['হঠাৎ জরুরি টাকা বা কোড চাওয়া', 'কল করতে বললে এড়িয়ে যাওয়া', 'ভাষা বা ডাক একটু অন্যরকম'],
        d: ['সরাসরি ফোন বা ভিডিও কলে নিশ্চিত হোন', 'ফ্যামিলি কোডওয়ার্ড জিজ্ঞেস করুন', 'অ্যাকাউন্টটি রিপোর্ট করুন ও বন্ধুকে অন্য মাধ্যমে জানান'],
        x: 'ভাই একটু বিপদে পড়েছি, ফোনে কথা বলা যাচ্ছে না। জরুরি ৫,০০০ টাকা বিকাশ করো প্লিজ, কাল সকালেই ফেরত দেব। কাউকে বোলো না।' },
      en: { t: 'Money asked from a friend\'s hacked account', w: 'Someone you know asks on Messenger or WhatsApp for urgent money or "a code". The account is actually in a scammer\'s hands.',
        s: ['A sudden request for money or a code', 'They dodge when you ask for a call', 'The wording feels slightly off'],
        d: ['Confirm over a real phone or video call', 'Ask for your family secret word', 'Report the account and warn your friend another way'],
        x: 'Bro I\'m in trouble and can\'t talk on the phone. Please bKash 5,000 taka urgently, I\'ll return it tomorrow morning. Don\'t tell anyone.' } },
    { id: 'loan-app', ico: '📲', tac: ['fear', 'secrecy'], scen: 'loan-app',
      bn: { t: 'লোন অ্যাপ: ছোট ঋণ, বড় ব্ল্যাকমেইল', w: 'দ্রুত লোনের অ্যাপ ইনস্টল করালে সে কন্টাক্ট ও ছবির অনুমতি চায়। পরে ঋণ শোধের পরও হুমকি দেয় ও আপনার পরিচিতদের মেসেজ পাঠায়।',
        s: ['কন্টাক্ট, গ্যালারি ও লোকেশনের অনুমতি চাওয়া', 'অস্বাভাবিক সুদ ও সময়সীমা', 'অ্যাপ প্লে স্টোরের বাইরের লিংক থেকে'],
        d: ['অনুমতি না দিয়ে অ্যাপটি মুছে দিন', 'হুমকি এলে ৯৯৯ বা পুলিশকে জানান', 'ফোনের স্ক্রিনশট ও কল রেকর্ড রাখুন'],
        x: 'সময়মতো টাকা না দিলে আপনার সব কন্টাক্টে আপনার ছবি আর "প্রতারক" লেখা পাঠানো হবে। আজই ৮,০০০ টাকা দিন।' },
      en: { t: 'Loan apps: a small loan, a big blackmail', w: 'A quick-loan app asks for contacts and photos. Later it threatens you, even after repayment, and messages the people you know.',
        s: ['Asks for contacts, gallery and location access', 'Unusual interest and deadlines', 'Installed from a link outside the Play Store'],
        d: ['Deny the permissions and delete the app', 'Report threats to 999 or the police', 'Keep screenshots and call records'],
        x: 'If you do not pay on time, we will send your photo and the word "fraud" to all your contacts. Pay 8,000 taka today.' } },
    { id: 'overseas-job', ico: '✈️', tac: ['greed', 'fee'], scen: 'fake-job',
      bn: { t: 'বিদেশে চাকরি ও ভিসার অগ্রিম ফি', w: 'ফেসবুক পেজ বা এজেন্ট বিদেশে ভালো বেতনের কাজ দেখিয়ে ভিসা, মেডিকেল ও ট্রেনিংয়ের নামে আগে টাকা চায়।',
        s: ['চুক্তির কাগজ ছাড়া টাকা চাওয়া', 'ব্যক্তিগত বিকাশ/নগদ নম্বরে টাকা', 'বেতন অস্বাভাবিক বেশি, যোগ্যতা লাগে না'],
        d: ['এজেন্সির লাইসেন্স সরকারি তালিকায় মিলিয়ে নিন', 'কোনো টাকা দেবেন না যতক্ষণ না লিখিত চুক্তি পান', 'অফিসে গিয়ে সরাসরি যাচাই করুন'],
        x: 'দুবাইয়ে হোটেলে কাজ, বেতন ১,২০,০০০ টাকা। ভিসা ও মেডিকেলের জন্য আজই ২৫,০০০ টাকা 01712345678 নম্বরে বিকাশ করুন, সিট প্রায় শেষ!' },
      en: { t: 'Overseas jobs and upfront visa fees', w: 'A Facebook page or agent shows a high-paying job abroad, then asks for money first for visa, medical and training.',
        s: ['Money asked before any contract', 'Payment to a personal bKash/Nagad number', 'Pay is unusually high with no qualifications needed'],
        d: ['Check the agency licence against the official government list', 'Pay nothing until you hold a written contract', 'Visit the office and verify in person'],
        x: 'Hotel job in Dubai, salary 120,000 taka. Send 25,000 taka by bKash to 01712345678 today for visa and medical, seats nearly gone!' } },
    { id: 'utility-cut', ico: '💡', tac: ['fear', 'urgency'], scen: 'fake-authority',
      bn: { t: 'বিদ্যুৎ/গ্যাস লাইন কাটা হবে', w: 'SMS বা কল: "বিল বাকি, আজ রাতেই লাইন কাটা হবে। এই নম্বরে ফোন করুন বা লিংকে পেমেন্ট করুন।" দেওয়া নম্বর ও লিংক সরকারি নয়।',
        s: ['আজ রাতেই কেটে দেওয়ার তাড়া', 'ব্যক্তিগত নম্বর বা অচেনা লিংকে পেমেন্ট', 'ভয় দেখিয়ে কল না কাটতে বলা'],
        d: ['বিল অফিসিয়াল অ্যাপ বা অফিস থেকে যাচাই করুন', 'কোনো লিংকে পেমেন্ট করবেন না', 'নম্বর রিপোর্ট ও ব্লক করুন'],
        x: 'আপনার বিদ্যুৎ বিল বকেয়া। আজ রাত ১০টায় সংযোগ বিচ্ছিন্ন হবে। এখনই 01712345678 নম্বরে কল করুন অথবা http://power-bill-bd.top/pay এ পেমেন্ট করুন।' },
      en: { t: '"Your electricity or gas will be cut off"', w: 'An SMS or call: "Bill overdue, the line will be cut tonight. Call this number or pay via the link." The number and link are not official.',
        s: ['A rush to act tonight', 'Payment to a personal number or unknown link', 'Fear used to keep you on the call'],
        d: ['Verify the bill in the official app or office', 'Do not pay through any link', 'Report and block the number'],
        x: 'Your electricity bill is overdue. The connection will be cut at 10 pm tonight. Call 01712345678 now or pay at http://power-bill-bd.top/pay.' } },
    { id: 'relief-link', ico: '🎁', tac: ['greed', 'authority'], scen: 'lucky-draw',
      bn: { t: 'সরকারি ভাতা / বৃত্তি / ত্রাণের নকল লিংক', w: '"আপনি সরকারি সহায়তার জন্য নির্বাচিত" বলে একটি লিংকে নাম, NID ও মোবাইল ব্যাংকিং তথ্য চাওয়া হয়।',
        s: ['কোনো আবেদন না করেও নির্বাচিত', 'সরকারি নামের সাথে .xyz/.top ধরনের ঠিকানা', 'NID ও PIN একসাথে চাওয়া'],
        d: ['সরকারি সুবিধা শুধু সরকারি সাইট বা অফিস থেকে যাচাই করুন', 'NID নম্বর ও PIN কাউকে দেবেন না', 'লিংক ফরওয়ার্ড করবেন না, রিপোর্ট করুন'],
        x: 'অভিনন্দন! সরকারি বিশেষ ভাতার জন্য আপনি নির্বাচিত। ২ ঘণ্টার মধ্যে http://govt-bhata-bd.xyz এ NID ও বিকাশ নম্বর দিয়ে আবেদন নিশ্চিত করুন।' },
      en: { t: 'Fake government allowance / stipend / relief links', w: '"You are selected for government support" with a link that asks for your name, NID and mobile-banking details.',
        s: ['Selected without applying', 'A government-sounding name on a .xyz/.top address', 'NID and PIN asked together'],
        d: ['Check any benefit only on official government sites or offices', 'Never give your NID number or PIN', 'Report the link instead of forwarding it'],
        x: 'Congratulations! You are selected for a special government allowance. Within 2 hours confirm at http://govt-bhata-bd.xyz with your NID and bKash number.' } },
    { id: 'romance-invest', ico: '💘', tac: ['trust', 'greed'], scen: 'romance-invest',
      bn: { t: 'অনলাইনের "বন্ধু" ও বিনিয়োগ গ্রুপ', w: 'অনলাইনে ভাব জমানো কেউ আপনাকে "নিশ্চিত লাভের" অ্যাপে বা গ্রুপে বিনিয়োগ করাতে চায়। শুরুতে ছোট লাভ দেখায়, তারপর বড় অঙ্ক জমা করায়।',
        s: ['কখনো দেখা বা ভিডিও কল নয়', 'লাভ নিশ্চিত বলে প্রতিশ্রুতি', 'টাকা তোলার সময় নতুন ফি'],
        d: ['অচেনা কারো কথায় বিনিয়োগ নয়', 'প্ল্যাটফর্ম অনুমোদিত কি না নিয়ন্ত্রক সংস্থার তালিকায় দেখুন', 'পরিবারের কাউকে জানান'],
        x: 'আমার চাচার অ্যাপে ১০,০০০ লাগালে ৩ দিনে ২৫,০০০ হয়। তোমাকে বিশ্বাস করি বলেই বলছি, কাউকে বোলো না। আজই শুরু করো।' },
      en: { t: 'Online "friends" and investment groups', w: 'Someone you met online pushes you into a "guaranteed profit" app or group. A small early win is shown, then you deposit much more.',
        s: ['They never meet or video call', 'Profit is promised as certain', 'A new fee appears when you try to withdraw'],
        d: ['Never invest on a stranger\'s word', 'Check the platform on the regulator\'s approved list', 'Tell someone in your family'],
        x: 'My uncle\'s app turns 10,000 into 25,000 in 3 days. I trust you so I am telling you, don\'t tell anyone. Start today.' } },
    { id: 'marketplace', ico: '📦', tac: ['urgency', 'fee'], scen: 'marketplace',
      bn: { t: 'অনলাইন কেনাবেচায় "অ্যাডভান্স" ফাঁদ', w: 'বিক্রেতা সেজে সামনে ছবি দেখায় ও আগাম বুকিং চায়; ক্রেতা সেজে ভুয়া পেমেন্ট স্ক্রিনশট বা "ডেলিভারি চার্জ" ফাঁদ দেয়।',
        s: ['দেখা না করেই অ্যাডভান্স চাওয়া', 'বাজারদরের চেয়ে অনেক কম দাম', 'পেমেন্ট হয়েছে বলে শুধু স্ক্রিনশট'],
        d: ['পণ্য হাতে নিয়ে টাকা দিন', 'নিজের অ্যাপে টাকা ঢুকেছে কি না দেখুন', 'নিরাপদ ডেলিভারি সার্ভিস ব্যবহার করুন'],
        x: 'ভাই আজই বুকিং না দিলে অন্য কাস্টমার নিয়ে যাবে। ৫,০০০ টাকা অ্যাডভান্স 01712345678 এ পাঠান, কাল ডেলিভারি।' },
      en: { t: 'The "advance payment" trap in online buying and selling', w: 'A fake seller shows photos and wants a booking fee; a fake buyer sends a fake payment screenshot or a "delivery charge" trap.',
        s: ['Advance asked before meeting', 'Price far below market', 'Only a screenshot as proof of payment'],
        d: ['Pay after you hold the item', 'Check that the money really arrived in your own app', 'Use a safe delivery service'],
        x: 'Brother, if you do not book today another customer will take it. Send 5,000 taka advance to 01712345678, delivery tomorrow.' } }
  ];
  SG.ALERTS = ALERTS;

  SG.exts.push(function (c) {
    const { VIEWS, $, $$, esc, bn, L, toast, addXP, award, waShare, save } = c;
    const st = () => c.S;

    /* ---------- সাপ্তাহিক অ্যালার্ট ---------- */
    const weekIdx = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / (864e5 * 7));
    const cur = () => ALERTS[weekIdx() % ALERTS.length];
    const T = (a) => (c.lang() === 'en' ? a.en : a.bn);
    SG.alertStrip = function () {
      const a = cur(), t = T(a);
      return `<a class="alertstrip" href="#/alerts"><span class="al-i">${a.ico}</span><span class="al-t"><b>${L('এই সপ্তাহের অ্যালার্ট', 'This week\'s alert')}</b>${esc(t.t)}</span><span class="al-go">${L('পড়ুন', 'Read')} ›</span></a>`;
    };
    function alertCard(a, open) {
      const t = T(a), s = st();
      const read = s.alertRead && s.alertRead[a.id];
      return `<article class="card alert ${open ? 'glow' : ''}"><div class="row sp"><span class="pill warn">${a.ico} ${L('প্রচলিত ফাঁদ', 'Common trap')}</span>${read ? `<span class="pill ok">✔ ${L('পড়েছেন', 'Read')}</span>` : ''}</div>
        <h2 style="margin:10px 0 6px">${esc(t.t)}</h2><p>${esc(t.w)}</p>
        <div class="msgbox" aria-label="${L('নমুনা বার্তা', 'Sample message')}"><small>${L('এমন বার্তা আসতে পারে', 'A message like this may arrive')}</small>${esc(t.x)}</div>
        <div class="grid g2" style="margin-top:12px"><div><b>🔍 ${L('চিনবেন যেভাবে', 'How to spot it')}</b><ul class="ul">${t.s.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <div><b>🛡️ ${L('করণীয়', 'What to do')}</b><ul class="ul">${t.d.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
        <div class="chips" style="margin:6px 0 12px">${a.tac.map((k) => `<span class="tc">${SG.TACTICS[k].i} ${c.tx(SG.TACTICS[k].l)}</span>`).join('')}</div>
        <div class="row"><button class="btn pri" data-scan="${a.id}">🔎 ${L('স্ক্যানারে যাচাই', 'Check in scanner')}</button><a class="btn" href="#/play/${a.scen}">⚡ ${L('অনুশীলন করুন', 'Practice it')}</a><button class="btn" data-share="${a.id}">💬 ${L('পরিবারকে জানান', 'Warn family')}</button>${read ? '' : `<button class="btn" data-read="${a.id}">✔ ${L('পড়েছি (+১৫ XP)', 'Mark as read (+15 XP)')}</button>`}</div></article>`;
    }
    VIEWS.alerts = function () {
      const a = cur(), idx = ALERTS.indexOf(a), s = st();
      s.alertRead = s.alertRead || {};
      const rest = ALERTS.filter((x) => x !== a).map((x) => { const t = T(x); return `<details class="card"><summary><span>${x.ico}</span><b>${esc(t.t)}</b>${s.alertRead[x.id] ? '<span class="pill ok">✔</span>' : ''}</summary>${alertCard(x, false)}</details>`; }).join('');
      c.V.innerHTML = `<div class="stack"><h1 style="font-size:1.8rem">📣 ${L('সাপ্তাহিক স্ক্যাম অ্যালার্ট', 'Weekly scam alert')}</h1>
        <p class="mut">${L('প্রতি সপ্তাহে একটি করে প্রচলিত ফাঁদ নিয়ে ফোকাস। এগুলো সবসময়ই ঘুরে বেড়ানো ধরন, নির্দিষ্ট কোনো ঘটনার খবর নয়। নতুন ঘটনার জন্য অফিসিয়াল সূত্র দেখুন।', 'One common trap in focus each week. These are recurring patterns, not news of a specific incident. For new incidents, check official sources.')}</p>
        <div class="row"><span class="pill acc">${L('এ সপ্তাহ', 'This week')} · ${bn(idx + 1)}/${bn(ALERTS.length)}</span></div>
        ${alertCard(a, true)}
        <h2 class="sec">${L('আগের ও পরের ফাঁদ', 'Other traps')}</h2>${rest}</div>`;
      c.V.firstElementChild.addEventListener('click', function h(e) {
        const b = e.target.closest('button'); if (!b) return;
        const id = b.dataset.scan || b.dataset.share || b.dataset.read; const al = ALERTS.find((x) => x.id === id); if (!al) return;
        if (b.dataset.scan) { try { sessionStorage.setItem('sg.prefill', T(al).x); } catch (er) { /* ignore */ } location.hash = '#/scan'; }
        if (b.dataset.share) waShare('⚠️ ' + T(al).t + '\n' + T(al).w + '\n\n' + L('সাবধান থাকুন। অনুশীলন করুন:', 'Stay alert. Practice here:') + ' ' + location.origin);
        if (b.dataset.read) { s.alertRead[id] = 1; save(); addXP(15); if (Object.keys(s.alertRead).length >= 3) award('alert'); VIEWS.alerts(); }
      });
    };

    /* ---------- লুক-অ্যালাইক লিংক ডিটেক্টর ---------- */
    const SC = c.SC;
    const NAMES = { 'bkash.com': 'bKash', 'nagad.com.bd': 'Nagad', 'dutchbanglabank.com': 'Dutch-Bangla Bank', 'dbbl.com.bd': 'DBBL', 'bracbank.com': 'BRAC Bank', 'grameenphone.com': 'Grameenphone', 'robi.com.bd': 'Robi', 'banglalink.net': 'Banglalink', 'airtel.com.bd': 'Airtel', 'daraz.com.bd': 'Daraz', 'pathao.com': 'Pathao', 'facebook.com': 'Facebook', 'google.com': 'Google', 'paypal.com': 'PayPal', 'whatsapp.com': 'WhatsApp', 'islamibankbd.com': 'Islami Bank', 'sonalibank.com.bd': 'Sonali Bank', 'agranibank.org': 'Agrani Bank', 'nidw.gov.bd': 'NID', 'bangladesh.gov.bd': 'Bangladesh Govt' };
    const REAL = Object.keys(NAMES);
    const GLOBAL = ['google', 'facebook', 'paypal', 'whatsapp'];
    function align(a, b) {
      const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
      for (let i = 0; i <= m; i++) d[i][0] = i; for (let j = 0; j <= n; j++) d[0][j] = j;
      for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      const ta = [], tb = []; let i = m, j = n;
      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && d[i][j] === d[i - 1][j - 1]) { ta.push(['s', a[i - 1]]); tb.push(['s', b[j - 1]]); i--; j--; }
        else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) { ta.push(['x', a[i - 1]]); tb.push(['x', b[j - 1]]); i--; j--; }
        else if (i > 0 && d[i][j] === d[i - 1][j] + 1) { ta.push(['x', a[i - 1]]); tb.push(['g', '·']); i--; }
        else { ta.push(['g', '·']); tb.push(['x', b[j - 1]]); j--; }
      }
      return { dist: d[m][n], a: ta.reverse(), b: tb.reverse() };
    }
    const paint = (ops, good) => ops.map((o) => (o[0] === 's' ? esc(o[1]) : `<mark class="${o[0] === 'g' ? 'gap' : good ? 'okc' : 'badc'}">${esc(o[1])}</mark>`)).join('');
    function inspect(input) {
      const raw = String(input || '').trim(); if (!raw) return null;
      let host = '';
      try { host = new URL(/^https?:\/\//i.test(raw) ? raw : 'http://' + raw).hostname.toLowerCase().replace(/\.$/, ''); } catch (e) { return { err: true }; }
      if (!host || host.indexOf('.') < 0) return { err: true };
      const nonAscii = /[^\x00-\x7f]/.test(raw.split('/')[2] || raw.split('/')[0]), puny = host.includes('xn--');
      const reg = SC.regDomain(host), sub = host.slice(0, Math.max(0, host.length - reg.length)).replace(/\.$/, '');
      const label = reg.split('.')[0], tld = reg.slice(label.length + 1);
      const real = REAL.includes(reg) && !nonAscii && !puny;
      let best = null;
      for (const r of REAL) { const d = Math.min(SC.lev(SC.leet(reg), SC.leet(r)), SC.lev(reg, r)); if (!best || d < best.d) best = { r, d }; }
      const brandInSub = REAL.find((r) => sub && sub.replace(/[-_.]/g, '').includes(r.split('.')[0].replace(/-/g, '')) && r !== reg);
      const brandInLabel = SC.BRANDS.find((b) => b.length >= 5 && !(GLOBAL.includes(b) && label === b) && (SC.leet(label.replace(/[-_]/g, '')).includes(b) || label.replace(/[-_]/g, '').includes(b)));
      let kind = 'unknown', target = null, why = [];
      if (real) kind = 'real';
      else if (nonAscii || puny) { kind = 'fake'; target = best && best.d <= 4 ? best.r : null; why.push(L('ঠিকানায় এমন অক্ষর আছে যা দেখতে ইংরেজির মতো, আসলে ভিন্ন (হোমোগ্লিফ)।', 'The address uses letters that look like English ones but are different (homoglyphs).')); }
      else if (!GLOBAL.includes(label) && REAL.some((r) => r.split('.')[0] === label && r !== reg)) { kind = 'fake'; target = REAL.find((r) => r.split('.')[0] === label); why.push(L('নাম হুবহু এক, কিন্তু ডোমেইন-প্রান্ত আলাদা। প্রান্ত বদলালে মালিকও বদলে যায়।', 'The name is identical but the ending differs. A different ending means a different owner.')); }
      else if (best && best.d <= Math.max(2, Math.floor(label.length / 3))) { kind = 'fake'; target = best.r; why.push(L('আসল ঠিকানার সাথে অক্ষরের সামান্য তফাত। দ্রুত পড়লে ধরা কঠিন।', 'A tiny letter difference from the real address. Hard to spot when reading fast.')); }
      else if (brandInSub) { kind = 'fake'; target = brandInSub; why.push(L(`"${NAMES[brandInSub]}" নামটা শুধু সাবডোমেইনে বসানো। আসল মালিক ডান দিকের ${reg}।`, `"${NAMES[brandInSub]}" is only placed as a subdomain. The real owner is ${reg} on the right.`)); }
      else if (brandInLabel) {
        const t = REAL.find((r) => r.split('.')[0].replace(/-/g, '').indexOf(brandInLabel) === 0) || REAL.find((r) => r.includes(brandInLabel));
        
        kind = 'fake'; target = t || null; why.push(L('ব্র্যান্ডের নামের সাথে বাড়তি শব্দ বা প্রান্ত জুড়ে দেওয়া হয়েছে। অফিসিয়াল সাইট এমন হয় না।', 'The brand name has an extra word or ending attached. Official sites are not written like this.'));
      }
      if (kind === 'fake' && target && label === target.split('.')[0] && tld !== target.slice(target.indexOf('.') + 1)) why.push(L('নাম হুবহু এক, কিন্তু ডোমেইন-প্রান্ত (.' + tld + ') আলাদা। প্রান্ত বদলালে মালিকও বদলে যায়।', 'The name is identical but the ending (.' + tld + ') differs. A different ending means a different owner.'));
      const a = SC.analyzeUrl(raw);
      return { host, reg, sub, label, tld, kind, target, why, aln: target ? align(reg, target) : null, flags: a ? a.flags : [], raw };
    }
    function mutate(real) {
      const [label, ...r] = real.split('.'), tld = r.join('.'), pick = (a) => a[Math.floor(Math.random() * a.length)];
      const opts = [];
      [['o', '0'], ['l', '1'], ['i', 'l'], ['m', 'rn'], ['a', 'e']].forEach((p) => { if (label.includes(p[0])) opts.push(label.replace(p[0], p[1]) + '.' + tld); });
      opts.push(label + '-' + pick(['login', 'secure', 'verify', 'offer', 'update']) + '.' + pick(['com', 'xyz', 'top', 'live']));
      opts.push(label + '.' + pick(['co', 'net', 'org', 'xyz', 'cc']));
      opts.push(label + '.' + tld + '.' + pick(['secure-login', 'verify-now', 'claim-bd']) + '.top');
      opts.push(label.slice(0, 2) + label[1] + label.slice(2) + '.' + tld);
      return pick(opts.filter((x) => x !== real));
    }
    VIEWS.lookalike = function () {
      const s = st();
      c.V.innerHTML = `<div class="stack"><h1 style="font-size:1.8rem">🕸️ ${L('ভুয়া লিংক ডিটেক্টর', 'Look-alike link check')}</h1>
        <p class="mut">${L('সন্দেহজনক লিংক বসান। আমরা দেখাব আসল ঠিকানার সাথে ঠিক কোন অক্ষর বদলানো হয়েছে। সবকিছু আপনার ডিভাইসেই হয়, কোনো সার্ভারে যায় না।', 'Paste a suspicious link. We show exactly which letters differ from the real address. Everything runs on your device; nothing is sent to a server.')}</p>
        <div class="card"><div class="chips" style="margin-bottom:10px">${['bkas-h.com', 'bkash.com.verify-now.top', 'nagad.xyz', 'dutchbanglabank.com', 'faceb00k.com'].map((x) => `<button class="btn sm" data-ex="${x}">${x}</button>`).join('')}</div>
        <div class="row"><input class="field" id="lk" placeholder="${L('যেমন: bkash-bonus.xyz/claim', 'e.g. bkash-bonus.xyz/claim')}" maxlength="300" aria-label="${L('লিংক', 'Link')}" style="flex:1;min-width:200px"><button class="btn pri" id="lkgo">🔎 ${L('যাচাই', 'Check')}</button></div></div>
        <div id="lkout"></div>
        <div class="card glow"><div class="row sp"><b>🎯 ${L('ড্রিল: কোনটি আসল?', 'Drill: which one is real?')}</b><span class="pill">${L('সেরা', 'Best')} ${bn(s.lookBest || 0)}/${bn(5)}</span></div><div id="drill" style="margin-top:10px"></div></div></div>`;
      const out = $('#lkout'), inp = $('#lk');
      function show(v) {
        const r = inspect(v);
        if (!r) { out.innerHTML = ''; return; }
        if (r.err) { out.innerHTML = `<div class="card"><b>${L('লিংকটি পড়া যায়নি', 'Could not read that link')}</b><p class="sm mut">${L('একটি ঠিকানা দিন, যেমন example.com', 'Enter an address such as example.com')}</p></div>`; return; }
        const stamp = { real: ['ok', L('অফিসিয়াল তালিকায় আছে', 'On the official list')], fake: ['no', L('নকল ঠিকানা', 'Look-alike address')], unknown: ['wr', L('অচেনা ঠিকানা', 'Unknown address')] }[r.kind];
        const anat = `<div class="anat" role="img" aria-label="${L('ঠিকানার অংশ', 'Address parts')}">${r.sub ? `<span class="seg sub"><i>${esc(r.sub)}.</i><small>${L('সাবডোমেইন', 'subdomain')}</small></span>` : ''}<span class="seg own"><i>${esc(r.label)}</i><small>${L('মালিকের নাম', 'owner name')}</small></span><span class="seg tld"><i>.${esc(r.tld)}</i><small>${L('প্রান্ত', 'ending')}</small></span></div><p class="sm mut">${L('ঠিকানা ডান দিক থেকে পড়ুন: প্রান্তের ঠিক আগের নামটাই আসল মালিক। বাঁ দিকের অংশ যা খুশি হতে পারে।', 'Read the address from the right: the name right before the ending is the real owner. Anything on the left can be anything.')}</p>`;
        const diff = r.aln && r.aln.dist <= 5 ? `<div class="vs"><div><small>${L('আপনার লিংক', 'Your link')}</small><code>${paint(r.aln.a, false)}</code></div><div><small>${L('আসল: ', 'Real: ')}${esc(NAMES[r.target] || '')}</small><code>${paint(r.aln.b, true)}</code></div></div><p class="sm mut">${L(`${bn(r.aln.dist)}টি অক্ষরের তফাত`, `${r.aln.dist} letter difference(s)`)}</p>` : '';
        const why = r.why.length ? `<ul class="ul">${r.why.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
        const fl = r.flags.length ? `<b>${L('আরও সংকেত', 'More signals')}</b><ul class="ul">${r.flags.map((f) => `<li>${esc(f.t)}</li>`).join('')}</ul>` : '';
        const note = r.kind === 'real' ? L('এই ঠিকানা আমাদের অফিসিয়াল তালিকার সাথে মেলে। তবু লিংকে ঢোকার আগে মেসেজটা সন্দেহজনক কি না ভাবুন। তালিকাটি সব সাইট ধরে না, তাই "অচেনা" মানেই নিরাপদ নয়।', 'This address matches our official list. Still ask whether the message itself is suspicious. The list does not cover every site, so "unknown" never means safe.') : r.kind === 'unknown' ? L('পরিচিত ব্র্যান্ডের নকল ধরা পড়েনি, কিন্তু এটা নিরাপদও প্রমাণ নয়। টাকা বা তথ্য দেওয়ার আগে নিজে অফিসিয়াল সাইটে গিয়ে যাচাই করুন।', 'No known-brand copy detected, but that does not prove it is safe. Go to the official site yourself before giving money or details.') : L('এই লিংকে কোনো তথ্য দেবেন না। যা করবেন: ব্রাউজারে নিজে অফিসিয়াল ঠিকানা লিখে ঢুকুন বা অ্যাপ ব্যবহার করুন।', 'Do not enter any details on this link. Instead, type the official address yourself or use the official app.');
        out.innerHTML = `<div class="card result lk"><div class="stamp ${stamp[0]}">${stamp[1]}</div><h3 style="margin-top:6px">${esc(r.host)}</h3>${anat}${diff}${why}${fl}<p style="margin-top:10px">${note}</p></div>`;
        if (!s.lookChecks) s.lookChecks = 0; s.lookChecks++; save();
      }
      $('#lkgo').onclick = () => show(inp.value);
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') show(inp.value); });
      $$('[data-ex]').forEach((b) => b.addEventListener('click', () => { inp.value = b.dataset.ex; show(b.dataset.ex); }));

      /* ড্রিল */
      let round = 0, score = 0;
      function drill() {
        const dr = $('#drill');
        if (round >= 5) {
          if (score > (s.lookBest || 0)) { s.lookBest = score; save(); }
          addXP(score * 6); if (score === 5) award('lookalike');
          dr.innerHTML = `<p><b>${L('আপনার স্কোর', 'Your score')}: ${bn(score)}/${bn(5)}</b></p><p class="sm mut">${score === 5 ? L('নিখুঁত! আসল ঠিকানা চিনতে আপনার চোখ তৈরি।', 'Perfect! Your eye for the real address is trained.') : L('আবার চেষ্টা করুন। প্রতিবার অক্ষর মিলিয়ে দেখুন।', 'Try again. Compare letter by letter each time.')}</p><button class="btn pri" id="dagain">${L('আবার খেলুন', 'Play again')}</button>`;
          $('#dagain').onclick = () => { round = 0; score = 0; drill(); }; return;
        }
        const real = REAL[Math.floor(Math.random() * REAL.length)];
        const fakes = new Set(); let guard = 0; while (fakes.size < 2 && guard++ < 30) fakes.add(mutate(real));
        const opts = c.shuffle([real, ...fakes]);
        dr.innerHTML = `<p class="sm mut">${L('প্রশ্ন', 'Question')} ${bn(round + 1)}/${bn(5)}</p><p style="margin:4px 0 10px">${L(`<b>${NAMES[real]}</b>-এর আসল ঠিকানা কোনটি?`, `Which is the real address of <b>${NAMES[real]}</b>?`)}</p><div class="stack">${opts.map((o) => `<button class="ch mono" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><div id="dfb"></div>`;
        $$('.ch', dr).forEach((b) => b.addEventListener('click', () => {
          if (dr.dataset.lock === '1') return; dr.dataset.lock = '1';
          const ok = b.dataset.o === real; if (ok) score++;
          $$('.ch', dr).forEach((x) => { x.disabled = true; x.classList.add(x.dataset.o === real ? 'good' : x === b ? 'wrong' : 'dim'); });
          $('#dfb').innerHTML = `<p class="${ok ? '' : 'sm'}" style="margin-top:10px"><b>${ok ? '✅ ' + L('ঠিক!', 'Correct!') : '❌ ' + L('ভুল', 'Not quite')}</b> ${L('আসল: ', 'Real: ')}<code>${esc(real)}</code></p><button class="btn pri sm" id="dnext" style="margin-top:6px">${L('পরের', 'Next')} ›</button>`;
          $('#dnext').onclick = () => { dr.dataset.lock = '0'; round++; drill(); };
        }));
      }
      drill();
    };

    /* ---------- সিক্রেট ওয়ার্ড প্ল্যান ---------- */
    const W1 = ['কাঁঠাল', 'নৌকা', 'শাপলা', 'ইলিশ', 'ঘুড়ি', 'বটতলা', 'জারুল', 'কদম', 'মেঘলা', 'পদ্মা'];
    const W2 = ['টেবিল', 'ছাতা', 'বাঁশি', 'সাইকেল', 'চাঁদ', 'লন্ঠন', 'আয়না', 'হাঁস', 'মাটি', 'ঝিনুক'];
    const E1 = ['mango', 'river', 'lantern', 'kite', 'monsoon', 'canoe', 'violet', 'copper', 'maple', 'pebble'];
    const E2 = ['table', 'umbrella', 'flute', 'bicycle', 'moon', 'mirror', 'duck', 'clay', 'shell', 'ladder'];
    const BAD = ['password', 'pass', '1234', 'ammu', 'abbu', 'amma', 'abba', 'mama', 'baba', 'bangladesh', 'dhaka', 'bkash', 'admin', 'qwerty', 'আম্মু', 'আব্বু', 'বাবা', 'ভাই', 'বাংলাদেশ', 'ঢাকা'];
    function strength(w) {
      const v = (w || '').trim(); const notes = []; let sc = 0;
      if (!v) return null;
      if (v.length >= 6) sc++; else notes.push(L('কমপক্ষে ৬ অক্ষর রাখুন', 'Use at least 6 characters'));
      if (/[\s\-_]/.test(v) || (v.match(/[a-zA-Z]+|[^\x00-\x7f\s]+/g) || []).length >= 2) sc++; else notes.push(L('দুটি সম্পর্কহীন শব্দ জুড়ুন', 'Join two unrelated words'));
      if (/\d/.test(v) && /\D/.test(v)) sc++; else notes.push(L('একটি সংখ্যা মেশান', 'Mix in a number'));
      if (/^\d+$/.test(v) || /(19|20)\d{2}/.test(v) || /\d{6,}/.test(v)) { sc = Math.min(sc, 1); notes.push(L('জন্মসাল বা শুধু সংখ্যা নয়', 'Avoid birth years or all digits')); }
      if (BAD.some((b) => v.toLowerCase().includes(b))) { sc = 0; notes.push(L('সহজ অনুমানযোগ্য শব্দ এড়ান', 'Avoid easy-to-guess words')); }
      return { sc: Math.max(0, Math.min(3, sc)), notes };
    }
    const CALLS = [
      { bn: 'আম্মু বলছি রে... আমি খুব বিপদে পড়েছি, ফোন হারিয়ে গেছে। এই নম্বরে ১৫ হাজার টাকা বিকাশ কর, এখনই! বাবাকে বলিস না।', en: 'It\'s Mum... I\'m in real trouble, I lost my phone. Send 15 thousand taka by bKash to this number, right now! Don\'t tell Dad.' },
      { bn: 'ভাইয়া, আমি দুর্ঘটনায় পড়েছি। হাসপাতালে ভর্তি করতে এখনই দশ হাজার লাগবে। কথা বলতে পারছি না, শুধু পাঠাও!', en: 'Brother, I had an accident. I need ten thousand right now to be admitted. I can\'t talk, just send it!' },
      { bn: 'আমি তোমার স্যার বলছি। জরুরি একটা পেমেন্ট আটকে আছে। এখনই ২০ হাজার টাকা পাঠাও, পরে অফিসে মিটিয়ে দেব।', en: 'This is your boss. An urgent payment is stuck. Send 20 thousand taka right now, I will settle it at the office.' }
    ];
    VIEWS.secret = function () {
      const s = st();
      const members = () => s.fam || (s.fam = []);
      const REL = [['mom', 'মা', 'Mother'], ['dad', 'বাবা', 'Father'], ['spouse', 'স্বামী/স্ত্রী', 'Spouse'], ['child', 'সন্তান', 'Child'], ['sib', 'ভাই/বোন', 'Sibling'], ['gp', 'দাদা/দাদি/নানা/নানি', 'Grandparent'], ['fr', 'ঘনিষ্ঠ বন্ধু', 'Close friend']];
      const rel = (k) => { const r = REL.find((x) => x[0] === k) || REL[0]; return L(r[1], r[2]); };
      const DAYS = 90;
      function paintFam() {
        const box = $('#fam'); if (!box) return;
        const now = Date.now();
        box.innerHTML = members().length ? members().map((m, i) => {
          const due = m.date && now - m.date > DAYS * 864e5, left = m.date ? Math.max(0, Math.ceil((m.date + DAYS * 864e5 - now) / 864e5)) : null;
          return `<div class="mem ${m.told && m.tested ? 'done' : ''}"><div class="row sp"><b>${esc(m.name)} <small class="mut">· ${rel(m.rel)}</small></b><button class="btn sm ghost" data-del="${i}" aria-label="${L('মুছুন', 'Remove')}">✕</button></div>
            <label class="chk"><input type="checkbox" data-told="${i}" ${m.told ? 'checked' : ''}> ${L('শব্দটা সামনাসামনি বলেছি (মেসেজে নয়)', 'I told them the word in person (not by message)')}</label>
            <label class="chk"><input type="checkbox" data-test="${i}" ${m.tested ? 'checked' : ''}> ${L('একবার পরীক্ষা করে দেখেছি, উনি মনে রেখেছেন', 'I tested it once and they remember it')}</label>
            ${m.date ? `<div class="sm ${due ? '' : 'mut'}">${due ? `<span class="pill warn">${L('শব্দ বদলানোর সময় হয়েছে', 'Time to change the word')}</span> <button class="btn sm" data-renew="${i}">${L('বদলে ফেলেছি', 'I changed it')}</button>` : L(`পরের বদল: ${bn(left)} দিন পর`, `Next change in ${left} days`)}</div>` : ''}</div>`;
        }).join('') : `<p class="sm mut">${L('এখনো কেউ নেই। নিচে নাম যোগ করুন।', 'Nobody yet. Add a name below.')}</p>`;
        const full = members().filter((m) => m.told && m.tested).length;
        $('#prog').innerHTML = `<div class="bar"><i style="width:${members().length ? Math.round((full / members().length) * 100) : 0}%"></i></div><span class="sm mut">${L(`${bn(full)}/${bn(members().length)} জন সুরক্ষিত`, `${full}/${members().length} protected`)}</span>`;
        if (full >= 1 && !s.badges.secret) { award('secret'); addXP(30); }
      }
      c.V.innerHTML = `<div class="stack"><h1 style="font-size:1.8rem">🗝️ ${L('সিক্রেট ওয়ার্ড প্ল্যান', 'Secret word plan')}</h1>
        <p class="mut">${L('এখন অল্প কিছু সেকেন্ডের রেকর্ডিং থেকেও কারও গলা নকল করা সম্ভব। তাই "গলা শুনে চিনেছি" আর যথেষ্ট নয়। পরিবারের প্রত্যেকের সাথে একটি গোপন শব্দ ঠিক করুন, যা শুধু আপনারা জানেন।', 'A voice can now be copied from just a few seconds of recording, so "I recognised the voice" is no longer enough. Agree one private word with each family member that only you know.')}</p>
        <div class="card"><b>1. ${L('শব্দ বানান', 'Make a word')}</b>
          <div class="code" id="wd" style="margin:12px 0">${L('— বানাতে বোতাম চাপুন —', '— press the button —')}</div>
          <div class="row"><button class="btn pri" id="wgen">🎲 ${L('নতুন শব্দ', 'New word')}</button><input class="field" id="wown" placeholder="${L('অথবা নিজের শব্দ পরীক্ষা করুন', 'Or test your own word')}" maxlength="30" style="flex:1;min-width:160px"></div>
          <div class="meter" id="wm" aria-live="polite"></div><div id="wn" class="sm mut"></div>
          <p class="sm mut" style="margin-top:8px">${L('এই শব্দ অ্যাপে সংরক্ষণ হয় না। মনে রাখুন বা সাবধানে লিখে রাখুন। সোশ্যাল মিডিয়ায় কখনো নয়।', 'This word is not stored in the app. Memorise it or write it down carefully. Never on social media.')}</p></div>
        <div class="card"><b>2. ${L('পরিবারের বৃত্ত', 'Your family circle')}</b><p class="sm mut">${L('প্রত্যেকের জন্য আলাদা শব্দ হলে ভালো। অ্যাপে শুধু নাম ও কাজের অগ্রগতি থাকে, শব্দ নয়।', 'A different word per person is best. The app stores only names and progress, never the word.')}</p>
          <div id="prog" style="margin:8px 0"></div><div id="fam" class="stack"></div>
          <div class="row" style="margin-top:12px"><input class="field" id="mn" placeholder="${L('নাম', 'Name')}" maxlength="24" style="flex:1;min-width:120px"><select class="field" id="mr" style="max-width:190px">${REL.map((r) => `<option value="${r[0]}">${L(r[1], r[2])}</option>`).join('')}</select><button class="btn" id="madd">＋ ${L('যোগ', 'Add')}</button></div></div>
        <div class="card"><b>3. ${L('ড্রিল: গলা চেনা কণ্ঠে টাকা চাইলে', 'Drill: a familiar voice asks for money')}</b><div id="dr" style="margin-top:10px"><button class="btn pri" id="dgo">🔊 ${L('কলটি শুনুন', 'Play the call')}</button></div></div>
        <div class="card"><b>4. ${L('পরিবারকে জানান', 'Tell your family')}</b><p class="sm mut">${L('একটি বার্তা পাঠিয়ে সবাইকে শব্দ ঠিক করতে ডাকুন। শব্দটি লিখে পাঠাবেন না।', 'Send a message inviting everyone to pick a word. Do not include the word itself.')}</p><div class="row" style="margin-top:8px"><button class="btn" id="winv">💬 ${L('হোয়াটসঅ্যাপে ডাকুন', 'Invite on WhatsApp')}</button></div></div></div>`;
      const mt = (v) => { const r = strength(v); const m = $('#wm'); if (!r) { m.innerHTML = ''; $('#wn').textContent = ''; return; } m.innerHTML = [0, 1, 2].map((i) => `<i class="${r.sc > i ? 'on s' + r.sc : ''}"></i>`).join('') + `<b class="sm">${[L('দুর্বল', 'Weak'), L('মোটামুটি', 'Fair'), L('ভালো', 'Good'), L('শক্তিশালী', 'Strong')][r.sc]}</b>`; $('#wn').textContent = r.notes.join(' · '); };
      $('#wgen').onclick = () => {
        const p = (a) => a[Math.floor(Math.random() * a.length)], en = c.lang() === 'en';
        const w = (en ? p(E1) + '-' + p(E2) : p(W1) + '-' + p(W2)) + '-' + Math.floor(10 + Math.random() * 89);
        $('#wd').textContent = w; $('#wown').value = ''; mt(w);
      };
      $('#wown').addEventListener('input', (e) => { $('#wd').textContent = e.target.value || L('— বানাতে বোতাম চাপুন —', '— press the button —'); mt(e.target.value); });
      $('#madd').onclick = () => { const n = $('#mn').value.trim(); if (!n) return toast(L('নাম লিখুন', 'Enter a name'), true); members().push({ name: n.slice(0, 24), rel: $('#mr').value, told: false, tested: false, date: Date.now() }); save(); $('#mn').value = ''; paintFam(); };
      $('#fam').addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.del != null) { members().splice(+b.dataset.del, 1); save(); paintFam(); }
        if (b.dataset.renew != null) { const m = members()[+b.dataset.renew]; m.date = Date.now(); m.tested = false; save(); paintFam(); toast(L('নতুন শব্দ ঠিক করে নিশ্চিত করুন', 'Agree the new word and confirm it')); }
      });
      $('#fam').addEventListener('change', (e) => { const t = e.target; if (t.dataset.told != null) members()[+t.dataset.told].told = t.checked; if (t.dataset.test != null) members()[+t.dataset.test].tested = t.checked; save(); paintFam(); });
      $('#winv').onclick = () => waShare(L('আমরা পরিবারের সবাই একটা গোপন শব্দ ঠিক করি। কেউ টাকা চেয়ে ফোন করলে (গলা যত চেনাই হোক) আগে এই শব্দটা জিজ্ঞেস করব। এ বিষয়ে ১ মিনিট সময় দাও, সামনাসামনি বলব।', 'Let\'s all agree on a secret word. If anyone calls asking for money (however familiar the voice), we ask for this word first. Give me a minute, I\'ll tell you in person.') + ' ' + location.origin);
      function playCall() {
        const call = CALLS[Math.floor(Math.random() * CALLS.length)], line = L(call.bn, call.en);
        c.speak(line);
        const opts = c.shuffle([
          { t: L('"গলা তো চেনা, পাঠিয়ে দিচ্ছি।"', '"The voice is familiar, sending now."'), k: 'fatal', f: L('এখানেই ফাঁদ। এআই দিয়ে গলা নকল হয়, চেনা গলা প্রমাণ নয়।', 'This is the trap. AI can copy a voice; a familiar voice is not proof.') },
          { t: L('"আগে আমাদের সিক্রেট ওয়ার্ডটা বলো।"', '"First tell me our secret word."'), k: 'safe', f: L('সঠিক। আসল মানুষ শব্দটা জানে, নকলকারী জানে না। আর সে এড়িয়ে গেলে সেটাই সংকেত।', 'Right. The real person knows it; an impostor does not. If they dodge, that is your signal.') },
          { t: L('"রাখো, আমি পুরোনো নম্বরে নিজে কল দিচ্ছি।"', '"Hang on, I\'ll call your old number myself."'), k: 'safe', f: L('সঠিক। সংরক্ষিত নম্বরে নিজে কল করলে সত্যটা সাথে সাথে জানা যায়।', 'Right. Calling the saved number yourself reveals the truth straight away.') },
          { t: L('"আগে অর্ধেক পাঠাই, পরে বাকিটা।"', '"I\'ll send half first, the rest later."'), k: 'risky', f: L('আংশিক টাকাও ক্ষতি। যাচাই না করে একটা টাকাও নয়।', 'Even part of the money is a loss. Not one taka before verifying.') }
        ]);
        $('#dr').innerHTML = `<div class="callbub">📞 ${esc(line)}</div><div class="stack" style="margin-top:10px">${opts.map((o, i) => `<button class="ch" data-i="${i}">${o.t}</button>`).join('')}</div><div id="drf"></div>`;
        $$('#dr .ch').forEach((b) => b.addEventListener('click', () => {
          const o = opts[+b.dataset.i]; $$('#dr .ch').forEach((x) => (x.disabled = true));
          b.classList.add(o.k === 'safe' ? 'good' : 'wrong');
          $('#drf').innerHTML = `<div class="coach ${o.k}" style="margin-top:10px"><b>${{ safe: '✅', risky: '⚠️', fatal: '❌' }[o.k]}</b> ${esc(o.f)}</div><button class="btn sm" id="dre" style="margin-top:8px">🔁 ${L('আরেকটি কল', 'Another call')}</button>`;
          if (o.k === 'safe') addXP(10); $('#dre').onclick = playCall;
        }));
      }
      $('#dgo').onclick = playCall;
      paintFam();
    };
  });
})();
