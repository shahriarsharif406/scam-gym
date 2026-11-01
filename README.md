# Scam Gym

**A training gym for scams. Practise against an AI scammer before you meet a real one.**

Built for the *Ostad Presents YUNet AIgnite Buildathon 2026* · individual entry · B2C web app · Bangla and English.

Online fraud in Bangladesh runs on a few repeating moves: a caller who "works for bKash" and wants your OTP, a job that needs a registration fee, a relative on a new number who needs money today. People fall for them because they meet each trap for the first time under pressure. Scam Gym lets them meet it first in a safe place, make the mistake there, and see exactly which tactic fooled them.

![Home](docs/home.png)

## What it does

| | |
|---|---|
| **Arena** | Ten branching simulations (fake customer care, fake jobs, lucky-draw links, family impersonation, marketplace and courier fraud, fake police, loan-app blackmail, romance investment, fake delivery, a hacked friend). Every message is tagged with the manipulation tactic it uses. |
| **Live AI** | Gemini plays the scammer in an open conversation. You type anything; a coach grades each reply as safe, risky or fatal. Falls back to a scripted engine when offline. |
| **Scanner** | Paste a message or link. A rule engine (Bangla and English) highlights red flags, explains each one, and analyses links (look-alike brands, shorteners, bad TLDs, IP hosts, punycode). Optional Gemini second opinion and screenshot analysis. |
| **Quick Check** | Six questions to find out whether you are being scammed right now, with a direct route to SOS if money already moved. |
| **10-Minute Pause** | A cooling-off timer and checklist for before you send money. Scammers need you to hurry. |
| **Safety Audit** | Ten checks of your digital hygiene with a score and next actions. |
| **SOS** | First-15-minutes guide, helplines, and a generator for complaint drafts (police, mobile banking provider, bank). |
| **Family Shield** | A secret family codeword, a shareable rules card, and a large-text mode for parents. |
| **Weakness radar** | Tracks which tactics you actually fall for and recommends the simulation that trains them. |
| **Certificate** | A downloadable training certificate with your Scam IQ. |
| **Challenge links** | Share a result as a link; a friend plays the same scenario and tries to beat your stars. |

Also: XP, ranks, badges, daily challenge, streaks, text-to-speech, installable PWA that works offline.

<p>
<img src="docs/simulation.png" width="240" alt="Simulation">
<img src="docs/scanner.png" width="480" alt="Scanner">
</p>

## Design

The interface is a security-printing look: banknote-style paper, ink, guilloche rosettes, double-rule borders and rubber-stamp verdicts, because the product is about telling genuine from counterfeit. The simulator is a dark ink "device" on a light paper page. Type is Noto Serif Bengali and Fraunces for display, Hind Siliguri for text.

## Architecture

- Static front end: vanilla HTML, CSS and JavaScript, hash routing, `localStorage` for progress. No build step.
- `scanner.js`: weighted regex rules, link analysis, highlighting. Runs entirely on the device.
- `data.js`, `data2.js`: simulations, spot-the-scam cards, library, helplines. All numbers, links and names are fictional.
- `en.js`: English overlay applied at render time, so Bangla stays the source of truth.
- `api/chat.js`, `api/analyze.js`: Vercel serverless functions calling Gemini. Input caps, per-IP rate limiting, JSON-only output, prompts hardened against injection. The scammer persona never produces real numbers or URLs.
- `sw.js`, `manifest.webmanifest`: offline PWA.

Everything except the Gemini features works with no server and no key.

## Run it

```bash
# static only (no AI features)
python3 -m http.server 8080      # then open http://localhost:8080

# with AI features
npm i -g vercel
GEMINI_API_KEY=your_key vercel dev
```

Deploy to Vercel (framework: Other) and set `GEMINI_API_KEY`. Optional: `GEMINI_MODEL` (default `gemini-2.5-flash`).

Open with `?lang=en` for English, or use the language button in the header.

## Official sticker

The buildathon sticker is loaded from `assets/sticker.png` and shown in the header. If the file is missing, a text badge is shown instead.

## Safety and honesty

- Educational project. Simulations are fictional and the scammer never receives real personal data.
- Helplines are listed for convenience; verify numbers on the provider's official site or card before relying on them.
- The scanner is a rule-based aid, not a guarantee. AI output can be wrong, and the interface says so.
- Not legal or financial advice.

## Tests

```bash
node --check app.js data.js data2.js en.js scanner.js api/*.js
```

Scanner behaviour was checked against scam and genuine samples (genuine OTP notices score near zero), and every route and simulation was walked in jsdom.

© FutureTech.ai · MIT License
