/* Scam Gym — অফলাইন প্রশিক্ষণ প্যাক (৬টি অতিরিক্ত সিমুলেশন)। সব নম্বর, লিংক ও নাম কাল্পনিক। */
(function () {
  const SG = window.SG;
  SG.EN_EXACT = SG.EN_EXACT || {};
  const T = (bn, en) => { SG.EN_EXACT[bn] = en; return bn; };
  SG.EN_SUB = SG.EN_SUB || {};
  const Q = (bn, en) => { T(bn, en); return T('"' + bn + '"', '"' + en + '"'); };
  const C = (bn, en) => { SG.EN_SUB[bn] = en; return T(bn, en); };
  const S = (t, fb, next) => ({ k: 'safe', t, fb, next });
  const R = (t, fb, next) => ({ k: 'risky', t, fb, next });
  const F = (t, fb) => ({ k: 'fatal', t, fb, end: 'lose' });
  const W = (t, fb) => ({ k: 'safe', t, fb, end: 'win' });
  const tt = (bn, en) => ({ bn, en });
  const tact = (a) => a;

  SG.SCENARIOS.push(
    {
      id: 'courier', icon: '📦', title: C('কুরিয়ারের "কাস্টমস ফি"', 'The courier "customs fee"'), channel: C('এসএমএস ও ফোন', 'SMS and phone'), ui: 'chat', level: 2, xp: 110,
      caller: { n: T('এক্সপ্রেস কুরিয়ার', 'Express Courier'), s: T('অনলাইন', 'Online') },
      intro: T('আপনি কিছু অর্ডার করেননি, তবু একটি এসএমএস এল: "আপনার পার্সেল আটকে আছে"…', 'You did not order anything, yet an SMS arrives: "Your parcel is held"…'),
      lesson: [
        T('কুরিয়ার কোম্পানি পার্সেল ছাড়ার জন্য আগাম ব্যক্তিগত নম্বরে টাকা চায় না।', 'A courier company does not ask for advance money to a personal number to release a parcel.'),
        T('যে পার্সেল আপনি অর্ডার করেননি, তার জন্য ফি দেওয়ার কিছু নেই।', 'You owe no fee for a parcel you never ordered.'),
        T('এসএমএসের লিংকে নয়, কোম্পানির অফিসিয়াল অ্যাপ বা ট্র্যাকিং নম্বরে যাচাই করুন।', 'Verify in the courier\'s official app or tracking number, not via the SMS link.')
      ],
      steps: [
        { id: 's1', tactics: tact(['urgency', 'authority']), msg: T('আপনার পার্সেল গুদামে আটকে আছে। ২৪ ঘণ্টার মধ্যে ঠিকানা নিশ্চিত না করলে ফেরত যাবে। নিশ্চিত করুন: [লিংক]', 'Your parcel is held at the warehouse. If you do not confirm your address within 24 hours it will be returned. Confirm: [link]'),
          choices: [
            S(Q('আমি কিছু অর্ডার করিনি। লিংকে ঢুকব না, কোম্পানির অ্যাপে নিজে দেখব।', 'I ordered nothing. I will not open the link; I will check the company\'s app myself.'), T('ঠিক সিদ্ধান্ত। অর্ডার ছাড়া আসা পার্সেলের বার্তা প্রায়ই টোপ।', 'Right call. A parcel message with no order behind it is usually bait.'), 's2'),
            R(Q('কার পার্সেল? লিংকে ঢুকে একটু দেখি।', 'Whose parcel? Let me open the link and look.'), T('লিংকে ঢুকলেই ভুয়া ফর্মে আপনার তথ্য চাইবে। দেখার জন্যও ঢুকবেন না।', 'The link leads to a fake form that harvests your details. Do not open it even to look.'), 's2'),
            F(Q('ঠিকানা আর ফোন নম্বর দিয়ে নিশ্চিত করে দিলাম।', 'I confirmed by entering my address and phone number.'), T('আপনার ব্যক্তিগত তথ্য প্রতারকের হাতে গেল। এবার সেগুলো দিয়ে আরও বিশ্বাসযোগ্য ফাঁদ আসবে।', 'Your personal details are now with the scammer, who will use them to build a more convincing trap.'))
          ] },
        { id: 's2', tactics: tact(['fee', 'urgency']), msg: T('পার্সেল ছাড়াতে ১,২০০ টাকা কাস্টমস ফি লাগবে। এখনই এই বিকাশ নম্বরে পাঠান [নম্বর], না হলে পার্সেল নষ্ট করে ফেলা হবে।', 'Releasing the parcel needs a 1,200 taka customs fee. Send it now to this bKash number [number] or the parcel will be destroyed.'),
          choices: [
            S(Q('কাস্টমস ফি ব্যক্তিগত নম্বরে নেওয়া হয় না। আমি কিছু পাঠাব না।', 'Customs fees are not collected on a personal number. I am not sending anything.'), T('ঠিক ধরেছেন। সরকারি ফি কখনো ব্যক্তিগত মোবাইল ওয়ালেটে নেওয়া হয় না।', 'Correct. Official fees are never collected on a personal mobile wallet.'), 's3'),
            R(Q('১,২০০ টাকাই তো, পাঠিয়ে দিই। পার্সেলে দামি কিছু থাকতে পারে।', 'It is only 1,200 taka; the parcel may hold something valuable.'), T('এটাই লোভের ফাঁদ। টাকা দিলে নতুন নতুন ফি আসতেই থাকবে।', 'That is the greed hook. Once you pay, new fees keep arriving.'), 's3'),
            F(Q('ঠিক আছে, বিকাশে ১,২০০ টাকা পাঠালাম।', 'OK, I sent 1,200 taka by bKash.'), T('টাকা গেল, পার্সেল বলে কিছু ছিলই না। রিসিটের স্ক্রিনশট রেখে বিকাশ হেল্পলাইনে জানান।', 'The money is gone and there was never a parcel. Keep the receipt screenshot and report to the bKash helpline.'))
          ] },
        { id: 's3', tactics: tact(['fear', 'authority']), msg: T('আপনি ফি না দেওয়ায় পার্সেলে নিষিদ্ধ পণ্য পাওয়া গেছে বলে মামলা হবে। এখনই ৫,০০০ টাকা দিয়ে মিটিয়ে নিন।', 'Because you did not pay, banned goods were found in the parcel and a case will be filed. Settle it now with 5,000 taka.'),
          choices: [
            W(Q('আমি কিছু অর্ডারই করিনি। নম্বর ব্লক করে স্ক্রিনশট রাখছি, দরকারে থানায় জানাব।', 'I never ordered anything. I am blocking the number, keeping screenshots and will tell the police if needed.'), T('দারুণ। আইনি হুমকি দিয়ে টাকা চাইলে সেটা প্রতারণা। প্রমাণ রাখুন।', 'Well done. Demanding money under a legal threat is fraud. Keep the evidence.')),
            W(Q('সত্যি হলে পুলিশ নিজেই সমন পাঠাবে। আমি ৯৯৯-এ জানাচ্ছি।', 'If it were real the police would send a summons. I am informing 999.'), T('ঠিক। আসল মামলায় কেউ মোবাইল ওয়ালেটে টাকা চায় না।', 'Right. Nobody settles a real case through a mobile wallet.')),
            F(Q('মামলার ভয়ে ৫,০০০ টাকা পাঠিয়ে দিলাম।', 'Afraid of the case, I sent the 5,000 taka.'), T('ভয়ে টাকা দিলে দাবি আরও বাড়ে। ওরা জানে আপনি ভয় পান।', 'Paying out of fear only raises the demands. They now know you are frightened.'))
          ] }
      ]
    },
    {
      id: 'utility', icon: '💡', title: C('বিদ্যুৎ বিল কাটার হুমকি', 'The electricity disconnection threat'), channel: C('এসএমএস ও কল', 'SMS and call'), ui: 'call', level: 2, xp: 110,
      caller: { n: T('বিদ্যুৎ অফিস', 'Electricity office'), s: T('অচেনা নম্বর', 'Unknown number') },
      intro: T('সন্ধ্যায় ফোন বাজল। কেউ নিজেকে বিদ্যুৎ অফিসের কর্মকর্তা বলছে…', 'The phone rings in the evening. Someone claims to be an officer of the electricity office…'),
      lesson: [
        T('বিদ্যুৎ বিল বকেয়ার কারণে আজ রাতেই লাইন কাটা হয় না। লিখিত নোটিশ ও সময় দেওয়া হয়।', 'Power is not cut tonight over a pending bill. A written notice and time are given first.'),
        T('"এই নম্বরে বিল দিন" বা "অ্যাপ ইনস্টল করুন" শুনলেই ফোন কাটুন।', 'If you hear "pay the bill to this number" or "install this app", hang up.'),
        T('বিল যাচাই করতে নিজে মিটারের কার্ড বা অফিসিয়াল অ্যাপ ব্যবহার করুন।', 'Check the bill yourself using your meter card or the official app.')
      ],
      steps: [
        { id: 's1', tactics: tact(['authority', 'fear', 'urgency']), msg: T('আমি বিদ্যুৎ অফিস থেকে বলছি। আপনার তিন মাসের বিল বকেয়া। আজ রাত ৯টার মধ্যে না দিলে লাইন কেটে দেওয়া হবে।', 'This is the electricity office. Your bill is three months overdue. If it is not paid by 9 tonight the line will be cut.'),
          choices: [
            S(Q('আমি নিজে অফিসিয়াল অ্যাপে বিল দেখে নেব। আপনার কথায় কিছু দেব না।', 'I will check the bill in the official app myself. I will not pay on your word.'), T('সঠিক। নিজের চ্যানেলে যাচাই করাই সবচেয়ে নিরাপদ।', 'Correct. Verifying through your own channel is the safest.'), 's2'),
            R(Q('কত টাকা বকেয়া? একটু বলুন।', 'How much is overdue? Tell me.'), T('আপনি আলাপে ঢুকে গেলেন। ওরা এখন আপনার ভয়ের ওপর খেলবে।', 'You joined the conversation; they will now play on your fear.'), 's2'),
            F(Q('ভুল বুঝবেন না, এখনই ঠিক করে দিচ্ছি। কী করতে হবে?', 'Please do not cut it, I will fix it right now. What should I do?'), T('ভয় পেয়ে সহযোগিতা শুরু করলেন। এখন নির্দেশ মানলেই ক্ষতি।', 'Panicking and cooperating means every instruction you follow will hurt you.'))
          ] },
        { id: 's2', tactics: tact(['fee', 'remote']), msg: T('এই এসএমএসের লিংকের অ্যাপ ইনস্টল করুন, সেখান থেকে বিল মিটিয়ে দিন। না হলে লাইন কাটা পড়বেই।', 'Install the app from the link in the SMS and pay the bill there. Otherwise the line will certainly be cut.'),
          choices: [
            S(Q('লিংক থেকে অ্যাপ ইনস্টল করব না। আমি ফোন রেখে দিচ্ছি।', 'I will not install an app from a link. I am hanging up.'), T('ঠিক। লিংকের অ্যাপ ফোনের নিয়ন্ত্রণ নিয়ে নিতে পারে।', 'Right. An app from a link can take control of your phone.'), 's3'),
            R(Q('ইনস্টল করে দেখি, না মিললে মুছে দেব।', 'I will install it and delete it if it does not match.'), T('ইনস্টল করা মাত্রই ক্ষতি হয়ে যেতে পারে। পরে মুছলেও লাভ নেই।', 'Damage can happen the moment you install. Deleting later does not undo it.'), 's3'),
            F(Q('ইনস্টল করে সব পারমিশন দিয়ে দিলাম।', 'I installed it and gave all permissions.'), T('এখন প্রতারক আপনার ফোনের স্ক্রিন, SMS আর OTP দেখতে পারে।', 'The scammer can now see your screen, SMS and OTPs.'))
          ] },
        { id: 's3', tactics: tact(['secrecy', 'fear']), msg: T('শুনুন, কাউকে এই কলের কথা বলবেন না, তাহলে আপনার ফাইল ঝামেলায় পড়বে। এখনই ৩,৫০০ টাকা পাঠান।', 'Listen, tell nobody about this call or your file will get into trouble. Send 3,500 taka right now.'),
          choices: [
            W(Q('"কাউকে বলবেন না" বলাটাই প্রতারণার চিহ্ন। আমি ব্লক করে পরিবারকে জানাচ্ছি।', '"Tell nobody" is itself the sign of fraud. I am blocking and telling my family.'), T('দারুণ। গোপনীয়তার দাবি মানে নিশ্চিত লাল পতাকা।', 'Excellent. A demand for secrecy is a sure red flag.')),
            W(Q('আমি নিজে অফিসে গিয়ে বা অ্যাপে মিটার নম্বর দিয়ে যাচাই করব।', 'I will verify myself at the office or in the app with my meter number.'), T('ঠিক। আসল অফিস সরাসরি গিয়ে যাচাই করতে বাধা দেয় না।', 'Right. A real office never stops you from checking in person.')),
            F(Q('ঠিক আছে, কাউকে বলব না। ৩,৫০০ টাকা পাঠালাম।', 'OK, I will tell nobody. I sent 3,500 taka.'), T('গোপনীয়তা মানলেন, টাকাও গেল। কেউ জানলে আপনাকে থামাতে পারত।', 'You kept the secret and lost the money. Someone knowing could have stopped you.'))
          ] }
      ]
    },
    {
      id: 'used-phone', icon: '🛍️', title: C('অনলাইন বিক্রয়ে অগ্রিম টাকা', 'Advance payment on a marketplace'), channel: C('ফেসবুক মার্কেটপ্লেস', 'Facebook Marketplace'), ui: 'chat', level: 2, xp: 110,
      caller: { n: T('বিক্রেতা তানভীর', 'Seller Tanvir'), s: T('অনলাইন', 'Online') },
      intro: T('একটি ব্যবহৃত ফোন সস্তায় বিক্রি হচ্ছে দেখে আপনি মেসেজ করলেন…', 'You message about a used phone being sold unusually cheap…'),
      lesson: [
        T('বাজারের চেয়ে অনেক কম দামই সবচেয়ে বড় টোপ।', 'A price far below market is the biggest bait.'),
        T('ফোন হাতে পাওয়ার আগে পুরো বা অগ্রিম টাকা দেবেন না। সরাসরি দেখে, পরীক্ষা করে নিন।', 'Do not pay in full or in advance before holding the phone. Meet, inspect and test it.'),
        T('"বুকিং মানি" বা "কুরিয়ার চার্জ" বলে টাকা চাওয়া প্রতারণার পরিচিত ছক।', '"Booking money" or "courier charge" is a well-known scam pattern.')
      ],
      steps: [
        { id: 's1', tactics: tact(['greed', 'urgency']), msg: T('ভাই, ফোনটা প্রায় নতুন, মাত্র ১৮,০০০ টাকা। আজই নিলে এই দাম, আরেকজন কিনতে চাইছে।', 'Brother, the phone is almost new, only 18,000 taka. This price only if you take it today; someone else wants it.'),
          choices: [
            S(Q('আমি সরাসরি দেখে, চালিয়ে দেখে তারপর টাকা দেব। জায়গা ঠিক করুন।', 'I will pay only after seeing and testing it in person. Pick a place.'), T('সঠিক। সরাসরি দেখা না হলে কেনাবেচা নয়।', 'Correct. No in-person inspection, no deal.'), 's2'),
            R(Q('এত কম দাম? ছবি আর পাঠান তো।', 'So cheap? Send more photos.'), T('ছবি সহজেই চুরি করা যায়। দাম নিয়ে সন্দেহ ছাড়বেন না।', 'Photos are easily stolen. Do not drop your doubt about the price.'), 's2'),
            F(Q('দারুণ, আমি কিনতে চাই। কীভাবে টাকা দেব?', 'Great, I want it. How do I pay?'), T('তাড়াহুড়োতে রাজি হয়ে গেলেন। এখন ওরা টাকা চাইবে।', 'You agreed in a rush. They will now ask for money.'))
          ] },
        { id: 's2', tactics: tact(['fee', 'trust']), msg: T('আমি ঢাকার বাইরে, কুরিয়ারে পাঠাব। ৩,০০০ টাকা বুকিং দিন, বাকিটা ফোন হাতে পেয়ে দেবেন। আমার আইডি কার্ডও পাঠাচ্ছি।', 'I am outside Dhaka and will send by courier. Pay 3,000 taka booking, the rest when you receive it. I will send my ID card too.'),
          choices: [
            S(Q('বুকিং বা অগ্রিম কিছু দেব না। ক্যাশ অন ডেলিভারি বা সরাসরি দেখা ছাড়া হবে না।', 'No booking or advance. Only cash on delivery or an in-person meeting.'), T('ঠিক। আইডি কার্ডের ছবিও জাল হতে পারে।', 'Right. An ID card photo can be fake too.'), 's3'),
            R(Q('আইডি আছে যখন, ৩,০০০ দিয়ে দিই।', 'He has shown an ID, so I will pay the 3,000.'), T('আইডির ছবি প্রমাণ নয়। ওটা অন্য কারও হতে পারে।', 'An ID photo proves nothing; it may belong to someone else.'), 's3'),
            F(Q('ঠিক আছে, বিকাশে ৩,০০০ টাকা পাঠালাম।', 'OK, I sent 3,000 taka by bKash.'), T('টাকা গেল। বিক্রেতা ব্লক করে দেবে, ফোনও আসবে না।', 'The money is gone. The seller will block you and no phone will come.'))
          ] },
        { id: 's3', tactics: tact(['urgency', 'trust']), msg: T('ঠিক আছে, শেষবার বলছি, সবটা এখনই পাঠান নইলে অন্যকে বিক্রি করে দেব। আমি পাঁচ বছর ধরে অনলাইনে বিক্রি করছি, বিশ্বাস করুন।', 'Final time: send everything now or I sell to someone else. I have sold online for five years, trust me.'),
          choices: [
            W(Q('তাড়াহুড়ো করাচ্ছেন বলেই আমার সন্দেহ। আমি অন্য কোথাও দেখব। ধন্যবাদ।', 'You are rushing me, which is exactly why I doubt this. I will look elsewhere. Thanks.'), T('দারুণ। চাপ বাড়লে বুঝবেন ফাঁদ কাছে।', 'Excellent. When the pressure rises, the trap is near.')),
            W(Q('আমি ব্লক করে পেজটা রিপোর্ট করছি।', 'I am blocking and reporting the page.'), T('সঠিক। রিপোর্ট করলে অন্যরাও বাঁচে।', 'Right. Reporting protects others too.')),
            F(Q('বিশ্বাস করলাম, পুরো ১৮,০০০ পাঠালাম।', 'I trust you; I sent the full 18,000.'), T('বিশ্বাসের নামে পুরো টাকা গেল। অগ্রিম কখনোই নয়।', 'Your whole amount went in the name of trust. Never pay in advance.'))
          ] }
      ]
    },
    {
      id: 'remittance', icon: '💱', title: C('প্রবাসী রেমিট্যান্সের "বোনাস"', 'The remittance "bonus"'), channel: C('ফোন কল', 'Phone call'), ui: 'call', level: 3, xp: 130,
      caller: { n: T('রেমিট্যান্স সেল', 'Remittance desk'), s: T('অচেনা নম্বর', 'Unknown number') },
      intro: T('আপনার ভাই বিদেশে থাকে। এক নম্বর থেকে ফোন এল: "আপনার জন্য রেমিট্যান্স এসেছে"…', 'Your brother works abroad. A call comes: "A remittance has arrived for you"…'),
      lesson: [
        T('টাকা পেতে কখনো টাকা বা OTP দিতে হয় না।', 'You never pay or share an OTP to receive money.'),
        T('"ভুল নম্বরে এসেছে, ফেরত দিন" ও "বোনাস পেতে ফি দিন" দুটোই পরিচিত ছক।', '"Sent to the wrong number, return it" and "pay a fee for the bonus" are both known patterns.'),
        T('আত্মীয়ের সঙ্গে সরাসরি কথা বলে নিশ্চিত হন। আর ব্যাংক বা অ্যাপে নিজে ব্যালেন্স দেখুন।', 'Confirm directly with your relative and check the balance yourself in the bank or app.')
      ],
      steps: [
        { id: 's1', tactics: tact(['trust', 'greed']), msg: T('আপনার ভাইয়ের পাঠানো ৫০,০০০ টাকা এসেছে, সঙ্গে ৫% সরকারি প্রণোদনা বোনাস। শুধু আপনার একটা ভেরিফিকেশন লাগবে।', 'Your brother\'s 50,000 taka has arrived, plus a 5% government incentive bonus. We only need your verification.'),
          choices: [
            S(Q('আমি ভাইকে ফোন করে এবং নিজের অ্যাপে দেখে নিশ্চিত হব।', 'I will call my brother and check my own app to confirm.'), T('ঠিক পথ। দুই উৎস থেকে যাচাই করুন।', 'Right path. Verify from two sources.'), 's2'),
            R(Q('বোনাস কীভাবে পাব, একটু বুঝিয়ে বলুন।', 'Explain how I get the bonus.'), T('বোনাসের লোভই ওদের টোপ। আলাপ বাড়ালে ওরা আরও ঢুকে পড়বে।', 'The bonus is exactly the bait. The longer you talk, the deeper they get in.'), 's2'),
            F(Q('বিশ্বাস করলাম। আমার তথ্য বলছি।', 'I believe you. I will give my details.'), T('ব্যক্তিগত তথ্য দিলে পরের ধাপে আরও জোরালো ফাঁদ আসবে।', 'Giving personal details means a stronger trap next.'))
          ] },
        { id: 's2', tactics: tact(['fee', 'authority']), msg: T('টাকা ছাড়তে ২,৫০০ টাকা ট্যাক্স আগে জমা দিন, সঙ্গে আপনার ফোনে যাওয়া কোডটা বলুন।', 'To release the money, deposit 2,500 taka tax first, and read out the code that just came to your phone.'),
          choices: [
            W(Q('টাকা পেতে ট্যাক্স বা কোড দিতে হয় না। আমি কল কাটছি।', 'You never pay tax or share a code to receive money. I am hanging up.'), T('দারুণ। এখানেই ফাঁদ ধরা পড়ল।', 'Excellent. This is where the trap gets exposed.')),
            R(Q('ট্যাক্স কোথায় জমা দেব?', 'Where do I deposit the tax?'), T('জানতে চাওয়াও আলাপ। পরের ধাপে ওরা আরও চাপ দেবে।', 'Asking is still engaging. They will pressure you more next.'), 's3'),
            F(Q('২,৫০০ টাকা পাঠালাম, কোডটা ৭৩১৯০৪।', 'I sent 2,500 taka and the code is 731904.'), T('টাকা ও কোড দুটোই গেল। এখন অ্যাকাউন্টও দখলে।', 'You lost both the money and the code. The account is now taken over.'))
          ] },
        { id: 's3', tactics: tact(['urgency', 'emotion']), msg: T('আপনার ভাই বিপদে পড়বে যদি এখনই না দেন। দেরি করলে টাকা সরকারি তহবিলে চলে যাবে।', 'Your brother will be in trouble if you do not pay now. Delay and the money goes to a government fund.'),
          choices: [
            W(Q('ভাইকে এখনই ফোন করছি। আপনার সঙ্গে আর কথা নয়।', 'I am calling my brother right now. I am done talking to you.'), T('ঠিক। আপনজনের ভয় দেখিয়ে টাকা চাইলে সরাসরি তাকেই ফোন করুন।', 'Right. If they use a loved one as a threat, call that person directly.')),
            W(Q('আমি ব্যাংকে গিয়ে নিজে খোঁজ নেব।', 'I will go to the bank and check myself.'), T('সঠিক। অফিসিয়াল শাখাই আসল তথ্য দিতে পারে।', 'Correct. Only the official branch can give real information.')),
            F(Q('ভাইয়ের জন্য ৫,০০০ টাকা পাঠিয়ে দিলাম।', 'For my brother\'s sake I sent 5,000 taka.'), T('আবেগে চাপ দিয়েই টাকা নেয়। ভাইয়ের কিছুই হয়নি।', 'They use emotional pressure to take your money. Nothing had happened to your brother.'))
          ] }
      ]
    },
    {
      id: 'qr', icon: '🔳', title: C('"টাকা পেতে" কিউআর স্ক্যান', 'Scan a QR "to receive money"'), channel: C('চ্যাট', 'Chat'), ui: 'chat', level: 2, xp: 110,
      caller: { n: T('ক্রেতা রনি', 'Buyer Roni'), s: T('অনলাইন', 'Online') },
      intro: T('আপনি একটি জিনিস বিক্রি করছেন। এক ক্রেতা বলছে সে এখনই টাকা পাঠাবে…', 'You are selling an item. A buyer says he will pay right away…'),
      lesson: [
        T('টাকা পাওয়ার জন্য কিউআর স্ক্যান বা পিন দিতে হয় না। কিউআর সবসময় টাকা পাঠানোর জন্য।', 'You never scan a QR or enter a PIN to receive money. A QR is for sending money.'),
        T('"ভুল পাঠিয়েছি, ফেরত দিন" বলে চাপ দিলে ব্যাংক বা অ্যাপের মাধ্যমে সমাধান করুন।', 'If told "I sent by mistake, return it", resolve it through the bank or app.'),
        T('পেমেন্ট এসেছে কি না, নিজের অ্যাপে দেখুন। ক্রেতার স্ক্রিনশটে নয়।', 'Check that payment arrived in your own app, not in the buyer\'s screenshot.')
      ],
      steps: [
        { id: 's1', tactics: tact(['trust', 'urgency']), msg: T('ভাই আমি এখনই কিনছি। আমি টাকা পাঠাতে পারছি না, আপনি এই কিউআর কোডটা স্ক্যান করলে টাকা পেয়ে যাবেন।', 'Brother, I am buying now. I cannot send money; if you scan this QR code you will receive it.'),
          choices: [
            S(Q('কিউআর স্ক্যান করলে আমার টাকা যায়, আসে না। আপনি সরাসরি আমার নম্বরে পাঠান।', 'Scanning a QR sends my money out, it does not bring it in. Send to my number directly.'), T('ঠিক। কিউআর মানে পাঠানো।', 'Right. A QR means paying out.'), 's2'),
            R(Q('স্ক্যান করে শুধু দেখি কী আসে।', 'I will scan just to see what happens.'), T('স্ক্যানের পর পিন চাইবে। দেখার জন্যও স্ক্যান নয়।', 'It will ask for your PIN after scanning. Do not scan even to look.'), 's2'),
            F(Q('স্ক্যান করে পিন দিয়ে দিলাম।', 'I scanned and entered my PIN.'), T('টাকা আপনার অ্যাকাউন্ট থেকে ওর কাছে চলে গেল।', 'The money left your account and went to him.'))
          ] },
        { id: 's2', tactics: tact(['fee', 'urgency']), msg: T('আচ্ছা তাহলে পাঠালাম, ভুল করে ২০,০০০ গেছে, বাড়তি ১৫,০০০ ফেরত দিন তাড়াতাড়ি। এই দেখুন স্ক্রিনশট।', 'OK I sent it, by mistake 20,000 went; return the extra 15,000 quickly. Here is the screenshot.'),
          choices: [
            W(Q('আমার অ্যাপে টাকা আসেনি। স্ক্রিনশট ভুয়া হতে পারে। আমি কিছু ফেরত দেব না।', 'No money reached my app. The screenshot can be fake. I am returning nothing.'), T('দারুণ। নিজের অ্যাপের ব্যালেন্সই একমাত্র প্রমাণ।', 'Excellent. Your own balance is the only proof.')),
            R(Q('ব্যালেন্স দেখি। কিছু বেশি এলে ফেরত দিই।', 'Let me check the balance and return any excess.'), T('আগে নিশ্চিত হয়ে নিন। প্রতারক এখনো চাপ দেবে।', 'Good to check first, but the scammer will keep pushing.'), 's3'),
            F(Q('ঠিক আছে, ১৫,০০০ ফেরত পাঠালাম।', 'OK, I returned 15,000.'), T('টাকা আসেনি, আপনি নিজের টাকা পাঠিয়ে দিলেন।', 'No money had arrived; you sent your own.'))
          ] },
        { id: 's3', tactics: tact(['fear', 'authority']), msg: T('আপনি টাকা না দিলে আমি থানায় গিয়ে বলব আপনি আমার টাকা মেরে দিয়েছেন। এখনই ফেরত দিন।', 'If you do not pay I will tell the police you took my money. Return it right now.'),
          choices: [
            W(Q('আমার অ্যাপে টাকা আসেনি। আপনি অভিযোগ করুন, আমি প্রমাণ দেখাব।', 'No money reached my app. File your complaint; I will show my records.'), T('সঠিক। প্রমাণ আপনার পক্ষে থাকলে ভয় পাওয়ার কিছু নেই।', 'Right. With the evidence on your side there is nothing to fear.')),
            W(Q('আমি ব্লক করছি এবং বিকাশে রিপোর্ট করছি।', 'I am blocking and reporting to the payment provider.'), T('ঠিক। প্রতারণার ঘটনা অ্যাপে রিপোর্ট করুন।', 'Right. Report fraud inside the app.')),
            F(Q('ঝামেলা এড়াতে ১৫,০০০ পাঠিয়ে দিলাম।', 'To avoid trouble I sent the 15,000.'), T('ভয়ে নিজের টাকা চলে গেল। প্রমাণ থাকলে ভয় নয়।', 'Fear cost you your own money. With evidence you need not fear.'))
          ] }
      ]
    },
    {
      id: 'nid', icon: '🪪', title: C('সিম বা এনআইডি "আপডেট"', 'The SIM or NID "update"'), channel: C('এসএমএস ও কল', 'SMS and call'), ui: 'call', level: 3, xp: 130,
      caller: { n: T('সিম রেজিস্ট্রেশন সেল', 'SIM registration cell'), s: T('অচেনা নম্বর', 'Unknown number') },
      intro: T('ফোন এল: "আপনার সিম বা এনআইডি তথ্য আপডেট না করলে সিম বন্ধ হয়ে যাবে"…', 'A call: "If you do not update your SIM or NID details your SIM will be blocked"…'),
      lesson: [
        T('অপারেটর ফোনে এনআইডি নম্বর, ছবি বা OTP চায় না। সিম আপডেট হয় অফিসিয়াল সেন্টার বা অ্যাপে।', 'Operators do not ask for your NID number, photo or OTP by phone. SIM updates happen at official centres or apps.'),
        T('এনআইডির ছবি দিলে আপনার নামে সিম বা অ্যাকাউন্ট খোলা হতে পারে।', 'Handing over an NID photo can let someone open SIMs or accounts in your name.'),
        T('সন্দেহ হলে নিজে অপারেটরের অফিসিয়াল হেল্পলাইনে ফোন করুন।', 'If in doubt, call the operator\'s official helpline yourself.')
      ],
      steps: [
        { id: 's1', tactics: tact(['authority', 'fear', 'urgency']), msg: T('আমি সিম রেজিস্ট্রেশন সেল থেকে বলছি। আপনার সিমের তথ্য অসম্পূর্ণ, আজই আপডেট না করলে ঘণ্টাখানেকের মধ্যে সিম বন্ধ হয়ে যাবে।', 'This is the SIM registration cell. Your SIM details are incomplete; if not updated today the SIM will be blocked within the hour.'),
          choices: [
            S(Q('আমি অপারেটরের অফিসিয়াল হেল্পলাইনে নিজে ফোন করে জেনে নেব।', 'I will call the operator\'s official helpline myself to find out.'), T('সঠিক। নিজের চ্যানেলে যাচাই করাই নিরাপদ।', 'Correct. Verify through your own channel.'), 's2'),
            R(Q('কী কী তথ্য লাগবে বলুন।', 'Tell me what details you need.'), T('জানতে চাওয়া মানে আলাপে রাজি। ওরা এবার আসল দাবি করবে।', 'Asking invites the real demand to come.'), 's2'),
            F(Q('আমার এনআইডি নম্বর আর জন্মতারিখ বলছি।', 'I will tell you my NID number and date of birth.'), T('এই দুটো তথ্য দিয়েই আপনার নামে সিম বা অ্যাকাউন্ট খোলা সম্ভব।', 'These two details are enough to open SIMs or accounts in your name.'))
          ] },
        { id: 's2', tactics: tact(['trust', 'secrecy']), msg: T('ঠিক আছে, তাহলে আপনার এনআইডি কার্ডের সামনে-পেছনের ছবি আর একটা সেলফি ওই নম্বরে পাঠান। এটা গোপন প্রক্রিয়া, কাউকে বলবেন না।', 'Fine, then send photos of the front and back of your NID plus a selfie to this number. This is a confidential process, tell nobody.'),
          choices: [
            S(Q('এনআইডির ছবি বা সেলফি ফোনে বা মেসেজে দেব না। আমি অফিসিয়াল সেন্টারে যাব।', 'I will not send NID photos or selfies by phone or message. I will visit an official centre.'), T('ঠিক। এনআইডির ছবি দিলে পরিচয় চুরি সম্ভব।', 'Right. NID photos enable identity theft.'), 's3'),
            R(Q('শুধু সামনের পাশটা পাঠাই।', 'I will only send the front.'), T('সামনের পাশেই নম্বর ও নাম থাকে, ওতেই ক্ষতি হতে পারে।', 'The front already holds your name and number; that alone can hurt you.'), 's3'),
            F(Q('সব ছবি আর সেলফি পাঠালাম।', 'I sent all photos and a selfie.'), T('এখন আপনার পরিচয়ে ভুয়া অ্যাকাউন্ট খোলা যেতে পারে। দ্রুত অপারেটর ও থানাকে জানান।', 'Fake accounts can now be opened in your name. Inform your operator and the police quickly.'))
          ] },
        { id: 's3', tactics: tact(['fear', 'urgency', 'remote']), msg: T('সময় শেষ! এখন শুধু ওটিপি কোডটা বলুন, তাহলেই সিম বাঁচবে। না হলে এখনই বন্ধ।', 'Time is up! Just read me the OTP code and the SIM is saved. Otherwise it is blocked now.'),
          choices: [
            W(Q('OTP আমি কাউকে দিই না। সিম বন্ধ হলে অফিসে গিয়ে ঠিক করব। কল কাটছি।', 'I never share an OTP. If the SIM is blocked I will fix it at the office. Hanging up.'), T('দারুণ। OTP কাউকে না দেওয়াই শেষ সুরক্ষা।', 'Excellent. Never sharing an OTP is the last line of defence.')),
            W(Q('আমি নম্বরটা ব্লক করে অপারেটরকে রিপোর্ট করছি।', 'I am blocking the number and reporting it to the operator.'), T('ঠিক। রিপোর্ট করলে অন্যদেরও সুরক্ষা হয়।', 'Right. Reporting protects others.')),
            F(Q('সিম বাঁচাতে কোডটা বললাম।', 'To save my SIM I read out the code.'), T('কোড দিলে সিমও গেল, অ্যাকাউন্টও দখলে গেল।', 'Giving the code loses both the SIM and your accounts.'))
          ] }
      ]
    }
  );
  SG.EN_SUB = SG.EN_SUB || {};
  SG.EN_SUB['প্রতারক যেসব কৌশল ব্যবহার করেছে'] = 'Tactics the scammer used';
  SG.EN_SUB['যেখানে নরম হয়েছিলেন'] = 'Where you went soft';
  [['স্ক্যাম ঠেকানোর অনুশীলন-জিম', 'The practice gym for stopping scams'], ['শিখুন', 'Learn'], ['সুরক্ষা', 'Protect'], ['প্রকল্প', 'Project'], ['সোর্স কোড', 'Source code'], ['স্কোর কার্ড', 'Score card']].forEach((x) => { SG.EN_EXACT[x[0]] = x[1]; });
})();
