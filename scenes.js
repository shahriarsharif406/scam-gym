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

    sundarban: () => {
      seed = 21; let L = '', R = '', roots = (x, y, n) => { let o = ''; for (let k = -n; k <= n; k++) o += `<path d="M${x + k * 5} ${y - 16}Q${x + k * 16} ${y - 2} ${x + k * 20} ${y + 16}" stroke="#2a0f05" stroke-width="2.4" fill="none"/>`; return o; };
      [[40, 120, 40], [130, 126, 32], [230, 118, 44], [330, 128, 30]].forEach((a) => { L += roots(a[0], a[1] + 28, 2) + `<circle cx="${a[0]}" cy="${a[1]}" r="${a[2]}" fill="#3a1608"/><circle cx="${a[0] + 22}" cy="${a[1] + 6}" r="${a[2] * 0.75}" fill="#4a1c0a"/>`; });
      [[860, 124, 38], [960, 116, 46], [1060, 126, 36], [1150, 120, 44]].forEach((a) => { R += roots(a[0], a[1] + 28, 2) + `<circle cx="${a[0]}" cy="${a[1]}" r="${a[2]}" fill="#3a1608"/><circle cx="${a[0] - 20}" cy="${a[1] + 6}" r="${a[2] * 0.75}" fill="#4a1c0a"/>`; });
      return `<defs>${grad('sdg1', [[0, '#7a2a5a'], [0.4, '#ff7a3a'], [0.75, '#ffc04a'], [1, '#ffe7a0']])}${grad('sdg2', [[0, '#ffa34a'], [1, '#6a1f12']])}${glow('sdgs', '#fff0b0')}</defs>
      <rect width="1200" height="200" fill="url(#sdg1)"/><circle cx="600" cy="112" r="190" fill="url(#sdgs)"/><circle cx="600" cy="112" r="44" fill="#fff3c0"/>
      ${ridge(118, 7, 0.012, 0.03, 1, '#8a3a2a', 0.55)}<rect y="128" width="1200" height="72" fill="url(#sdg2)"/>
      <g fill="#fff0b0" opacity=".6"><rect x="540" y="136" width="120" height="3"/><rect x="560" y="148" width="80" height="3"/><rect x="574" y="160" width="52" height="3"/></g>
      ${L}${R}
      <path d="M0 200V170Q60 160 140 168T330 164V200Z" fill="#3a1608"/><path d="M880 200V168Q980 158 1060 166T1200 160V200Z" fill="#3a1608"/>
      <g transform="translate(930 160) scale(-1 1)" fill="#1a0a04"><ellipse cx="0" cy="0" rx="30" ry="12"/><circle cx="32" cy="-6" r="9"/><path d="M28-14l3-8 5 7zM38-14l5-7 2 8z"/><rect x="-24" y="4" width="6" height="16"/><rect x="-8" y="6" width="6" height="14"/><rect x="12" y="6" width="6" height="14"/><rect x="24" y="4" width="6" height="16"/><path d="M-30-2Q-52-10-46-30" stroke="#1a0a04" stroke-width="5" fill="none" stroke-linecap="round"/></g>
      <g transform="translate(930 160) scale(-1 1)" stroke="#ff9a2e" stroke-width="2" fill="none" opacity=".8"><path d="M-14-10l4 9M-2-11l3 10M10-10l2 9"/></g>
      <path d="M470 60q8-7 16 0q8-7 16 0M720 40q6-5 12 0q6-5 12 0M300 52q6-5 12 0q6-5 12 0" stroke="#3a1608" fill="none" stroke-width="2" stroke-linecap="round"/>`;
    },
    stmartin: () => {
      return `<defs>${grad('smg1', [[0, '#ffd0a0'], [0.55, '#ffe9c8'], [1, '#bff0ff']])}${grad('smg2', [[0, '#27e6d0'], [0.6, '#1aa6d8'], [1, '#0f5aa8']])}${glow('smgs', '#fff3b0')}</defs>
      <rect width="1200" height="200" fill="url(#smg1)"/><circle cx="880" cy="62" r="110" fill="url(#smgs)"/><circle cx="880" cy="62" r="26" fill="#fff8d0"/>
      <g fill="#fff" opacity=".9"><ellipse cx="200" cy="40" rx="70" ry="13"/><ellipse cx="170" cy="32" rx="34" ry="12"/><ellipse cx="560" cy="58" rx="60" ry="11"/></g>
      <rect y="104" width="1200" height="96" fill="url(#smg2)"/>
      <g stroke="#fff" stroke-width="2" fill="none" opacity=".6"><path d="M0 120q60-8 120 0t120 0t120 0t120 0t120 0t120 0t120 0t120 0t120 0t120 0"/><path d="M-40 136q60-8 120 0t120 0t120 0t120 0t120 0t120 0t120 0t120 0t120 0t120 0"/></g>
      <path d="M700 108Q820 100 940 108T1200 106V112H700Z" fill="#fff" opacity=".5"/>
      <path d="M0 200V156Q150 140 330 160T640 170T1000 168T1200 160V200Z" fill="#f6dca0"/><path d="M0 200V178Q200 168 420 180T820 178T1200 176V200Z" fill="#e9c783"/>
      <g fill="#3a3a4a"><ellipse cx="720" cy="170" rx="34" ry="14"/><ellipse cx="760" cy="166" rx="20" ry="12"/></g><g fill="#fff" opacity=".85"><ellipse cx="690" cy="178" rx="26" ry="4"/><ellipse cx="770" cy="176" rx="18" ry="3.5"/></g>
      ${palm(150, 168, 118, 0.1, '#2a2a3a')}${palm(230, 172, 96, -0.1, '#2a2a3a')}${palm(1030, 170, 124, -0.1, '#2a2a3a')}${palm(1120, 176, 100, 0.1, '#2a2a3a')}
      <path d="M420 60q8-7 16 0q8-7 16 0M640 84q6-5 12 0q6-5 12 0" stroke="#4a4a6a" fill="none" stroke-width="2" stroke-linecap="round"/>`;
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
  const cloud = (x, y, s, op) => `<g class="drift" opacity="${op || 0.9}" fill="#fff"><ellipse cx="${x}" cy="${y}" rx="${70 * s}" ry="${12 * s}"/><ellipse cx="${x - 34 * s}" cy="${y - 7 * s}" rx="${34 * s}" ry="${12 * s}"/><ellipse cx="${x + 30 * s}" cy="${y - 8 * s}" rx="${40 * s}" ry="${13 * s}"/></g>`;
  Object.assign(SCENES, {
    sajek: () => {
      seed = 21;
      return `<defs>${grad('sj1', [[0, '#3d4f9c'], [0.45, '#e58fa8'], [1, '#ffd9a0']])}${glow('sjs', '#fff0b8')}${grad('sj2', [[0, '#1f5e5a'], [1, '#0c2f35']])}</defs>
      <rect width="1200" height="200" fill="url(#sj1)"/><circle cx="820" cy="118" r="120" fill="url(#sjs)"/><circle cx="820" cy="118" r="24" fill="#fff6cf"/>
      ${ridge(112, 14, 0.008, 0.021, 1, '#6e5fa0', 0.6)}
      <rect y="124" width="1200" height="40" fill="#fff" opacity=".55"/>${cloud(200, 134, 1.6, 0.85)}${cloud(560, 142, 1.9, 0.9)}${cloud(980, 132, 1.5, 0.85)}${cloud(380, 150, 1.2, 0.7)}
      ${ridge(150, 16, 0.011, 0.027, 3, '#2d7a6a', 0.95)}${ridge(172, 12, 0.014, 0.033, 5, '#1c5f52')}
      <g transform="translate(160 150)"><rect x="-22" y="-14" width="44" height="22" fill="#8a5a2e"/><path d="M-28 -14L0-34L28-14Z" fill="#c4452d"/><rect x="-5" y="-4" width="10" height="12" fill="#3a2410"/></g>
      <g transform="translate(250 160)"><rect x="-16" y="-10" width="32" height="16" fill="#7a4e28"/><path d="M-21 -10L0-26L21-10Z" fill="#d1583a"/></g>
      <path d="M470 50q8-7 16 0q8-7 16 0M690 36q6-5 12 0q6-5 12 0" stroke="#3a2f60" fill="none" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
    },
    ratargul: () => {
      seed = 33; let tr = '', rf = '';
      for (let i = 0; i < 26; i++) {
        const x = 20 + i * 46 + rnd() * 24, w = 4 + rnd() * 5, top = -10 + rnd() * 60;
        tr += `<path d="M${x} 120Q${x + (rnd() - 0.5) * 8} 70 ${x + (rnd() - 0.5) * 12} ${top}" stroke="#14382d" stroke-width="${w}" fill="none"/><circle cx="${x}" cy="${top + 6}" r="${20 + rnd() * 18}" fill="#1a5b3c" opacity=".92"/>`;
        rf += `<path d="M${x} 124L${x + (rnd() - 0.5) * 10} 190" stroke="#0e2a24" stroke-width="${w}" opacity=".35"/>`;
      }
      return `<defs>${grad('rt1', [[0, '#b8e6c0'], [0.6, '#5fb58a'], [1, '#1f6a4a']])}${grad('rt2', [[0, '#2b8f7c'], [1, '#0d3b3a']])}</defs>
      <rect width="1200" height="200" fill="url(#rt1)"/>
      <g opacity=".28" fill="#fffbd0"><path d="M300-10L380 124L330 124Z"/><path d="M640-10L740 124L680 124Z"/><path d="M930-10L1010 124L960 124Z"/></g>
      ${tr}<rect y="122" width="1200" height="78" fill="url(#rt2)"/>${rf}
      <g stroke="#cdf5d8" stroke-width="1.4" fill="none" opacity=".45"><path d="M0 150q60-5 120 0t120 0t120 0t120 0t120 0t120 0t120 0t120 0t120 0t120 0"/><path d="M-30 172q60-5 120 0t120 0t120 0t120 0t120 0t120 0t120 0t120 0t120 0t120 0"/></g>
      <g transform="translate(560 156)"><ellipse cx="0" cy="8" rx="64" ry="5" fill="#04201c" opacity=".5"/><path d="M-56 -4Q-44 12 0 12Q46 12 58 -8Q30 2 0 2Q-30 2 -56 -4Z" fill="#7a4a22"/><path d="M-20 -4Q-20 -24 0 -26Q20 -24 20 -4Z" fill="#e8c36a"/></g>`;
    },
    jaflong: () => {
      seed = 45; let st = '';
      for (let i = 0; i < 38; i++) st += `<ellipse cx="${rnd() * 1200}" cy="${172 + rnd() * 24}" rx="${5 + rnd() * 9}" ry="${3 + rnd() * 4}" fill="${['#8a8f93', '#a9a79c', '#6d7378', '#c2bba6'][i % 4]}" opacity=".9"/>`;
      return `<defs>${grad('jf1', [[0, '#7fa7c9'], [0.6, '#cfe3ef'], [1, '#eef5f2']])}${grad('jf2', [[0, '#35b6c4'], [1, '#157a8f']])}</defs>
      <rect width="1200" height="200" fill="url(#jf1)"/>${cloud(260, 40, 1.5, 0.9)}${cloud(780, 30, 1.8, 0.85)}
      ${ridge(78, 20, 0.007, 0.019, 2, '#5d7f93', 0.85)}${ridge(100, 16, 0.01, 0.025, 4, '#3f7a62', 0.95)}${ridge(122, 10, 0.013, 0.031, 1, '#2e6a4c')}
      <rect y="120" width="1200" height="12" fill="#fff" opacity=".35"/>
      <path d="M0 200L0 138Q300 126 620 140T1200 136V200Z" fill="url(#jf2)"/>
      <g stroke="#e8fbff" stroke-width="1.5" fill="none" opacity=".6"><path d="M80 150q50-6 100 0t100 0"/><path d="M520 156q50-6 100 0t100 0"/><path d="M860 148q50-6 100 0t100 0"/></g>
      ${st}
      <g transform="translate(700 158)"><path d="M-46 0Q-36 14 0 14Q36 14 48 -4Q26 4 0 4Q-26 4 -46 0Z" fill="#6a3f1c"/><path d="M-18 0Q-18 -16 0 -18Q18 -16 18 0Z" fill="#d9b25a"/><path d="M26 -2L34 -34" stroke="#3a2410" stroke-width="2"/></g>`;
    },
    lalakhal: () => {
      seed = 52; let b = '';
      for (let i = 0; i < 9; i++) b += kashTuft(24 + i * 132 + rnd() * 40, 132, 26 + rnd() * 20, (rnd() - 0.5) * 12, '#2f7a3c');
      return `<defs>${grad('ll1', [[0, '#4aa8e8'], [1, '#d7f1ff']])}${grad('ll2', [[0, '#1fd0c8'], [0.5, '#12a3b8'], [1, '#0b6a96']])}</defs>
      <rect width="1200" height="200" fill="url(#ll1)"/>${cloud(180, 36, 1.4, 0.95)}${cloud(620, 28, 1.7, 0.9)}${cloud(1000, 48, 1.2, 0.9)}
      ${ridge(104, 10, 0.009, 0.023, 3, '#4f9a62', 0.9)}<rect y="112" width="1200" height="20" fill="#2f7a3c"/>${b}
      <rect y="130" width="1200" height="70" fill="url(#ll2)"/>
      <g stroke="#e4fffb" stroke-width="1.6" fill="none" opacity=".55"><path d="M0 152q70-7 140 0t140 0t140 0t140 0t140 0t140 0t140 0t140 0t140 0"/><path d="M-60 176q70-7 140 0t140 0t140 0t140 0t140 0t140 0t140 0t140 0t140 0"/></g>
      <g transform="translate(470 158)"><ellipse cx="0" cy="12" rx="80" ry="5" fill="#053a52" opacity=".4"/><path d="M-70 -4Q-56 14 0 14Q58 14 72 -8Q38 2 0 2Q-38 2 -70 -4Z" fill="#f2f6f8"/><path d="M-70 -4Q-56 6 0 6Q58 6 72 -8" stroke="#1b6fb0" stroke-width="3" fill="none"/><rect x="-30" y="-24" width="52" height="20" rx="3" fill="#fff"/><path d="M-34 -24H26L20-34H-28Z" fill="#e0412e"/></g>`;
    },
    bandarban: () => {
      seed = 64;
      return `<defs>${grad('bb1', [[0, '#4a2c7a'], [0.5, '#f0708a'], [1, '#ffc16a']])}${glow('bbs', '#ffe08a')}</defs>
      <rect width="1200" height="200" fill="url(#bb1)"/><circle cx="330" cy="128" r="130" fill="url(#bbs)"/><circle cx="330" cy="128" r="28" fill="#fff0b0"/>
      <g opacity=".4" stroke="#fff6d0" stroke-width="3"><path d="M330 128L60 0M330 128L200 0M330 128L420 0M330 128L600 0M330 128L760 20"/></g>
      ${ridge(100, 22, 0.006, 0.017, 1, '#8a4f8f', 0.8)}${ridge(124, 18, 0.009, 0.023, 4, '#5a3a78', 0.9)}${cloud(900, 132, 1.8, 0.45)}${ridge(150, 14, 0.012, 0.03, 2, '#2f2a5e')}${cloud(300, 156, 1.6, 0.4)}${ridge(176, 10, 0.016, 0.035, 5, '#171a40')}
      <path d="M600 60q8-7 16 0q8-7 16 0M640 76q6-5 12 0q6-5 12 0M700 50q7-6 14 0q7-6 14 0" stroke="#2a1a4a" fill="none" stroke-width="2" stroke-linecap="round"/>`;
    }
  });
  const NAMES = {
    mangrove: ['সুন্দরবন', 'Sundarbans'], tea: ['শ্রীমঙ্গলের চা-বাগান', 'Sreemangal tea gardens'], sea: ['কক্সবাজার সমুদ্রসৈকত', "Cox's Bazar beach"],
    lake: ['কাপ্তাই হ্রদ, রাঙামাটি', 'Kaptai Lake, Rangamati'], shapla: ['শাপলার বিল', 'Shapla beel'], kash: ['শরতের কাশবন', 'Autumn kash fields'], monsoon: ['বর্ষার ধানক্ষেত', 'Monsoon paddy fields'], sajek: ['সাজেকের মেঘের সাগর', 'Sajek cloud sea'], ratargul: ['রাতারগুল জলাবন, সিলেট', 'Ratargul swamp forest'], jaflong: ['জাফলং, সিলেট', 'Jaflong, Sylhet'], lalakhal: ['লালাখাল, সিলেট', 'Lalakhal, Sylhet'], bandarban: ['বান্দরবানের পাহাড়', 'Bandarban hills'], sundarban: ['সুন্দরবনের ভোর', 'Dawn in the Sundarbans'], stmartin: ['সেন্ট মার্টিন দ্বীপ', "St Martin's Island"]
  };
  const MAP = { arena: 'sundarban', live: 'tea', scan: 'sea', voice: 'lake', lookalike: 'shapla', secret: 'kash', audit: 'stmartin', shield: 'sajek', triage: 'monsoon', alerts: 'ratargul', spot: 'jaflong', library: 'lalakhal', pause: 'bandarban', cert: 'sea', me: 'kash', offline: 'lake', card: 'shapla', sos: 'monsoon', share: 'sajek', family: 'lalakhal', tour: null, play: null, home: null };
  const KEYS = Object.keys(SCENES);
  SG.sceneKey = (name) => (name in MAP ? MAP[name] : KEYS[(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % KEYS.length]);
  SG.sceneBg = (key) => `<svg viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true">${SCENES[key]()}</svg>`;
  SG.sceneName = (key, en) => NAMES[key][en ? 1 : 0];
  SG.scene = function (name, en) {
    const key = SG.sceneKey(name); if (!key) return '';
    const cap = NAMES[key][en ? 1 : 0];
    return `<div class="pgscene sc-${key}" aria-hidden="true"><svg viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid slice" focusable="false">${SCENES[key]()}</svg><span class="pgcap">📍 ${cap}</span></div>`;
  };
})();
