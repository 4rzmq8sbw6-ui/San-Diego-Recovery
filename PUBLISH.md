# Publishing the prototype

The app is a static site (Vite + React). The production build lives in `dist/` after you run `npm run build`. Any static host will serve it. Pick the option that fits how quickly you want a shareable link.

---

## Option 1 — Netlify Drop (easiest, no account setup, ~2 min)

Best for handing a link to your director fast.

1. Build it:
   ```bash
   cd sd-recovery-navigator
   npm install
   npm run build
   ```
2. Go to **https://app.netlify.com/drop**
3. Drag the **`dist`** folder onto the page.
4. Netlify gives you a live URL instantly (e.g. `https://random-name.netlify.app`). Share that.

> To keep the URL and update it later, click "Sign up to claim this site."

---

## Option 2 — Vercel (great for ongoing updates)

```bash
npm install -g vercel      # once
cd sd-recovery-navigator
vercel                     # follow prompts; accept defaults
vercel --prod              # promote to a production URL
```

`vercel.json` is already configured (framework: vite, SPA rewrite).

---

## Option 3 — Netlify CLI (linked to a repo/folder)

```bash
npm install -g netlify-cli   # once
cd sd-recovery-navigator
netlify deploy --build       # draft URL
netlify deploy --build --prod  # production URL
```

`netlify.toml` is already configured.

---

## Option 4 — GitHub Pages

1. Push this folder to a GitHub repo.
2. In the repo: **Settings → Pages → Build and deployment → GitHub Actions**, pick the **Vite** workflow (or add one that runs `npm run build` and publishes `dist`).

> Note: GitHub Pages serves from a subpath (`/repo-name/`). If assets 404, set `base: "/repo-name/"` in `vite.config.ts` and rebuild.

---

## Preview locally before sharing

```bash
npm run serve      # serves the built dist/ on http://localhost:4173 (and your LAN IP)
```

The LAN URL (e.g. `http://192.168.x.x:4173`) works for anyone on the same Wi-Fi — handy for a quick in-office demo.

---

## Before a wider rollout

This is a **prototype with starter data**. Before real-world use:

- Verify every resource's phone, hours, and eligibility (items flagged "Verify details before use" especially).
- Expand `src/data/resources.ts` with the full county directory.
- Decide whether profiles need to persist; if so, add storage that keeps data de-identified.
