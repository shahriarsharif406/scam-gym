/* বাংলাদেশের প্রাকৃতিক দৃশ্য: প্রতিটি পেজের জন্য আলাদা, নিজের আঁকা SVG */
(function () {
  const SG = (window.SG = window.SG || {});
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const ridge = (y, amp, f1, f2, ph, fill, op) => {
    let d = `M0 200L0 ${y}`;
    for (let x = 0; x <= 1200; x += 30) d += `L${x} ${(y + amp * Math.sin(x * f1 + ph) + amp * 0.5 * Math.sin(x * f2 + ph * 2)).toFixed(1)}`;
    return `<path d="${d}L1200 200Z" fill="${fill}"${op ? ` opacity="${op}"` : ''}/>`;
  };
  const grad = (id, stops, x2, y2) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2 || 0}" y2="${y2 === 0 ? 0 : 1}">${stops.map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"/>`).join('')}</linearGradient>`;
  const glow = (id, c) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset=".4" stop-color="${c}" stop-opacity=".35"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
  const umbrella = (x, y, h, c) => `<path d="M${x} ${y}V${y - h}" stroke="${c}" stroke-width="3" fill="none"/><path d="M${x - 26} ${y - h + 6}Q${x} ${y - h - 20} ${x + 26} ${y - h + 6}Q${x} ${y - h - 2} ${x - 26} ${y - h + 6}Z" fill="${c}"/>`;
  const palm = (x, y, h, lean, c) => {
    const tx = x + lean * h, ty = y - h; let f = '';
    [[-40, -30, -84, 26], [-31, -34, -62, 8], [-20, -34, -40, -6], [40, -30, 84, 26], [31, -34, 62, 8], [20, -34, 40, -6], [0, -34, 0, -26]].forEach((a) => { f += `<path d="M${tx} ${ty}q${a[0] * 0.55} ${a[1] * 0.55} ${a[2] * 0.55} ${a[3] * 0.55}"/>`; });
    return `<path d="M${x} ${y}Q${x + lean * h * 0.2} ${y - h * 0.55} ${tx} ${ty}" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/><g stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round">${f}</g>`;
  };
  const kashTuft = (x, y, h, k, c) => `<path d="M${x} ${y}q${k} ${-h * 0.5} ${k * 1.6} ${-h}" stroke="${c}" stroke-width="1.4" fill="none" opacity=".7"/><ellipse cx="${x + k * 1.6}" cy="${y - h - 5}" rx="4" ry="12" fill="${c}" opacity=".9" transform="rotate(${k * 3} ${x + k * 1.6} ${y - h})"/>`;

  const SCENES = {
    mangrove: () => {
      seed = 11; let tr = '', fl = '';
      for (let i = 0; i < 9; i++) {
        const x = 40 + i * 140 + rnd() * 50, y = 128 + rnd() * 8, r = 34 + rnd() * 22;
        let roots = '';
        for (let k = -2; k <= 2; k++) roots += `<path d="M${x + k * 6} ${y - 14}Q${x + k * 20} ${y - 2} ${x + k * 24} ${y + 14}" stroke="#0a2b25" stroke-width="2.4" fill="none"/>`;
        tr += `${roots}<circle cx="${x}" cy="${y - 28}" r="${r}" fill="#0f4034"/><circle cx="${x - r * 0.6}" cy="${y - 20}" r="${r * 0.7}" fill="#12513f"/><circle cx="${x + r * 0.6}" cy="${y - 22}" r="${r * 0.72}" fill="#0d3a30"/>`;
        fl += `<circle cx="${x + (rnd() - 0.5) * 100}" cy="${60 + rnd() * 70}" r="2.2" fill="#ffe27a"/>`;
      }
      return `<defs>${grad('mg1', [[0, '#14304f'], [0.55, '#2a6a76'], [1, '#f4b27a']])}${grad('mg2', [[0, '#1f6a6a'], [1, '#07242a']])}</defs>
      <rect width="1200" height="200" fill="url(#mg1)"/><circle cx="930" cy="46" r="20" fill="#fff3d0"/><circle cx="940" cy="42" r="18" fill="#2a5a7a"/>
      ${ridge(112, 8, 0.01, 0.025, 1, '#16594a', 0.55)}<rect y="130" width="1200" height="70" fill="url(#mg2)"/>
      <g class="sc-ref" opacity=".35"><rect x="900" y="140" width="70" height="2"/><rect x="915" y="152" width="40" height="2"/></g>${tr}${fl}
      <rect y="136" width="1200" height="12" fill="#cfe9e4" opacity=".14"/>`;
    },
    tea: () => {
      let rows = '';
      for (let i = 0; i < 12; i++) rows += `<path d="M0 ${118 + i * 7}Q300 ${104 + i * 7} 620 ${116 + i * 7}T1200 ${112 + i * 7}" stroke="#a7e06a" stroke-width="1.4" fill="none" opacity=".5"/>`;
      return `<defs>${grad('tg1', [[0, '#8fd3ff'], [0.7, '#fdeab0'], [1, '#ffd48a']])}${glow('tgs', '#fff2b0')}</defs>
      <rect width="1200" height="200" fill="url(#tg1)"/><circle cx="260" cy="82" r="110" fill="url(#tgs)"/><circle cx="260" cy="82" r="24" fill="#fffbe0"/>
      ${ridge(88, 16, 0.006, 0.017, 0.6, '#6fb59a', 0.6)}${ridge(108, 14, 0.008, 0.02, 2.2, '#3f9a6d')}
      ${ridge(126, 12, 0.007, 0.018, 4, '#2f8a55')}${rows}${ridge(164, 10, 0.009, 0.02, 1.4, '#1f6f43')}
      ${umbrella(150, 150, 54, '#14502f')}${umbrella(540, 140, 48, '#14502f')}${umbrella(930, 146, 60, '#14502f')}${umbrella(1090, 156, 40, '#0f4026')}
      <rect y="96" width="1200" height="26" fill="#fff" opacity=".18"/><path d="M700 60q10-8 20 0q10-8 20 0M770 44q8-6 16 0q8-6 16 0" stroke="#2a4a3a" fill="none" stroke-width="2" stroke-linecap="round"/>`;
    },
    sea: () => {
      let w = '';
      for (let i = 0; i < 7; i++) w += `<path d="M0 ${118 + i * 8}q60-8 120 0t120 0t120 0t120 0t120 0t120 0t120 0t120 0t120 0t120 0" stroke="rgba(255,255,255,${0.5 - i * 0.05})" stroke-width="2" fill="none" transform="translate(${-i * 40} 0)"/>`;
      return `<defs>${grad('sg1', [[0, '#3b2a7a'], [0.45, '#e0527a'], [1, '#ffb347']])}${grad('sg2', [[0, '#f09a5a'], [1, '#2a3f86']])}${glow('sgs', '#ffe08a')}</defs>
      <rect width="1200" height="200" fill="url(#sg1)"/><circle cx="520" cy="116" r="130" fill="url(#sgs)"/><circle cx="520" cy="116" r="34" fill="#fff0b0"/>
      <rect y="116" width="1200" height="84" fill="url(#sg2)"/><g fill="#ffe7a0" opacity=".6"><rect x="470" y="124" width="100" height="2.5"/><rect x="486" y="136" width="68" height="2.5"/><rect x="500" y="148" width="40" height="2.5"/></g>${w}
      <path d="M240 112l18-30 18 30z" fill="#fff6e0" opacity=".9"/><path d="M232 114h54l-8 8h-38z" fill="#3a2a5a"/>
      <path d="M0 200V176Q300 160 600 172T1200 166V200Z" fill="#e8c48a"/><path d="M0 188Q300 176 600 186T1200 180V200H0Z" fill="#c9a06a"/>
      ${palm(1010, 184, 110, -0.12, '#20243e')}${palm(1100, 188, 90, 0.1, '#20243e')}${palm(120, 186, 80, 0.12, '#20243e')}<path d="M10 70q9-8 18 0q9-8 18 0M880 52q7-6 14 0q7-6 14 0" stroke="#2a1a4a" fill="none" stroke-width="2" stroke-linecap="round"/>`;
    },
    lake: () => `<defs>${grad('lg1', [[0, '#5fb4ff'], [1, '#d8f1ff']])}${grad('lg2', [[0, '#5aa6d8'], [1, '#0f4a86']])}${glow('lgs', '#fff7c0')}</defs>
      <rect width="1200" height="200" fill="url(#lg1)"/><circle cx="880" cy="70" r="90" fill="url(#lgs)"/><circle cx="880" cy="70" r="22" fill="#fffbe0"/>
      ${ridge(84, 20, 0.007, 0.02, 0.3, '#7fb4d8', 0.85)}${ridge(100, 18, 0.009, 0.024, 2, '#4f9fa8')}${ridge(116, 14, 0.01, 0.03, 4.4, '#2f8a6a')}
      <rect y="126" width="1200" height="74" fill="url(#lg2)"/><g fill="#fff" opacity=".35"><rect x="810" y="134" width="140" height="2"/><rect x="830" y="146" width="100" height="2"/></g>
      <g transform="translate(330 150)"><path d="M0 8Q40 28 100 6Q70 14 50 14Q20 14 0 8Z" fill="#7a3a1a"/><path d="M26 8Q26-14 52 -14Q78-14 78 8Z" fill="#c9722a"/></g>
      <rect y="108" width="1200" height="22" fill="#fff" opacity=".22"/>`,
    shapla: () => {
      seed = 5; let p = '', f = '';
      for (let i = 0; i < 16; i++) { const x = 30 + i * 74 + rnd() * 30, y = 140 + rnd() * 48, rx = 22 + rnd() * 16; p += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.28}" fill="#2f8f52"/><ellipse cx="${x + 3}" cy="${y - 1}" rx="${rx * 0.7}" ry="${rx * 0.18}" fill="#47b46a"/>`; }
      [[160, 150], [420, 168], [700, 148], [960, 172], [1100, 150]].forEach((a) => { f += `<g transform="translate(${a[0]} ${a[1]})"><ellipse cx="-12" cy="-6" rx="7" ry="14" fill="#ffe3ee" transform="rotate(-38 -12 -6)"/><ellipse cx="12" cy="-6" rx="7" ry="14" fill="#ffe3ee" transform="rotate(38 12 -6)"/><ellipse cx="0" cy="-9" rx="8" ry="17" fill="#fff"/><circle cx="0" cy="-2" r="4" fill="#ffc83d"/></g>`; });
      return `<defs>${grad('pg1', [[0, '#6a5acd'], [0.5, '#e8789a'], [1, '#ffcf8a']])}${grad('pg2', [[0, '#8a5a8a'], [1, '#1c2f4a']])}${glow('pgs', '#ffe0a0')}</defs>
      <rect width="1200" height="200" fill="url(#pg1)"/><circle cx="600" cy="112" r="120" fill="url(#pgs)"/><circle cx="600" cy="112" r="26" fill="#fff0c0"/>
      ${ridge(112, 8, 0.012, 0.03, 1, '#3a2a58', 0.9)}<g fill="#2a1f45">${[60, 250, 470, 760, 1000, 1140].map((x) => `<circle cx="${x}" cy="104" r="22"/><circle cx="${x + 18}" cy="110" r="16"/>`).join('')}</g>
      <rect y="122" width="1200" height="78" fill="url(#pg2)"/>${p}${f}
      <g stroke="#1f5a3a" stroke-width="2" fill="none">${[20, 90, 1130, 1170].map((x) => `<path d="M${x} 200q-6-40 4-70"/>`).join('')}</g>`;
    },
    kash: () => {
      seed = 3; let k = '', cl = '';
      for (let i = 0; i < 46; i++) { const x = rnd() * 1200, h = 30 + rnd() * 38; k += kashTuft(x, 176 + rnd() * 20, h, (rnd() - 0.5) * 14, '#f7f5ea'); }
      [[140, 42, 1], [520, 28, 0.8], [900, 50, 1.1]].forEach((a) => { cl += `<g transform="translate(${a[0]} ${a[1]}) scale(${a[2]})" fill="#fff" opacity=".92"><ellipse cx="0" cy="0" rx="50" ry="14"/><ellipse cx="-24" cy="-8" rx="26" ry="14"/><ellipse cx="14" cy="-12" rx="30" ry="16"/></g>`; });
      return `<defs>${grad('kg1', [[0, '#2e8de8'], [1, '#bfe6ff']])}${grad('kg2', [[0, '#7fd06a'], [1, '#2f8a3a']])}</defs>
      <rect width="1200" height="200" fill="url(#kg1)"/>${cl}${ridge(120, 8, 0.012, 0.03, 0.5, '#4fae6a', 0.7)}
      <rect y="138" width="1200" height="62" fill="url(#kg2)"/><g fill="#1f5a2a" opacity=".85">${[90, 300, 760, 1080].map((x) => `<rect x="${x}" y="108" width="5" height="32"/><circle cx="${x + 2}" cy="102" r="20"/>`).join('')}</g>
      ${k}`;
    },
    monsoon: () => {
      let r = '', p = '';
      for (let i = 0; i < 70; i++) { const x = (i * 19) % 1200 + rnd() * 10, y = 40 + (i * 37) % 100; r += `<path d="M${x} ${y}l-6 16"/>`; }
      for (let i = 0; i < 9; i++) p += `<path d="M0 ${150 + i * 6}Q300 ${144 + i * 6} 600 ${150 + i * 6}T1200 ${148 + i * 6}" stroke="#a6f08a" stroke-width="1.5" fill="none" opacity=".5"/>`;
      return `<defs>${grad('ng1', [[0, '#27334f'], [0.6, '#56648a'], [1, '#9aa8c8']])}${grad('ng2', [[0, '#4fa84a'], [1, '#1d5a2a']])}</defs>
      <rect width="1200" height="200" fill="url(#ng1)"/>
      <g fill="#1d2640" opacity=".85"><ellipse cx="200" cy="34" rx="150" ry="34"/><ellipse cx="560" cy="26" rx="190" ry="36"/><ellipse cx="960" cy="36" rx="170" ry="34"/></g>
      <path d="M700 40l-18 36h14l-12 34 30-44h-16z" fill="#ffe66a" opacity=".9"/>
      ${ridge(124, 8, 0.01, 0.03, 2, '#3a7a5a', 0.8)}<rect y="136" width="1200" height="64" fill="url(#ng2)"/>${p}
      <g stroke="rgba(220,235,255,.55)" stroke-width="1.3">${r}</g>
      <g transform="translate(360 150)"><path d="M-22 4Q0-22 22 4Z" fill="#e0b050"/><rect x="-3" y="4" width="6" height="22" fill="#6a3a1a"/></g>`;
    }
  };
  const NAMES = {
    mangrove: ['সুন্দরবন', 'Sundarbans'], tea: ['শ্রীমঙ্গলের চা-বাগান', 'Sreemangal tea gardens'], sea: ['কক্সবাজার সমুদ্রসৈকত', "Cox's Bazar beach"],
    lake: ['কাপ্তাই হ্রদ, রাঙামাটি', 'Kaptai Lake, Rangamati'], shapla: ['শাপলার বিল', 'Shapla beel'], kash: ['শরতের কাশবন', 'Autumn kash fields'], monsoon: ['বর্ষার ধানক্ষেত', 'Monsoon paddy fields']
  };
  const MAP = { arena: 'mangrove', live: 'tea', scan: 'sea', voice: 'lake', lookalike: 'shapla', secret: 'kash', audit: 'mangrove', shield: 'kash', triage: 'monsoon', alerts: 'monsoon', spot: 'lake', library: 'tea', pause: 'shapla', cert: 'sea', me: 'kash', offline: 'lake', card: 'shapla', sos: 'monsoon', family: 'kash', tour: null, play: null, home: null };
  const KEYS = Object.keys(SCENES);
  SG.sceneKey = (name) => (name in MAP ? MAP[name] : KEYS[(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % KEYS.length]);
  SG.scene = function (name, en) {
    const key = SG.sceneKey(name); if (!key) return '';
    const cap = NAMES[key][en ? 1 : 0];
    return `<div class="pgscene sc-${key}" aria-hidden="true"><svg viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid slice" focusable="false">${SCENES[key]()}</svg><span class="pgcap">📍 ${cap}</span></div>`;
  };
})();
