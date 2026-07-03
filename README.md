# San Diego Recovery Navigator

**Care Plan Builder** — match de-identified intake profiles to San Diego County emergency & recovery resources, then output a scored, sequenced plan of attack.

## Run locally

```bash
cd sd-recovery-navigator
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## How it works

1. **Profile** — Fill out the de-identified template (age, substances, MH/medical, housing, food, transport, income, documents, etc.). No names or PHI.
2. **Care plan** — The engine derives needs with severity, filters eligibility gates, scores fit, and sequences resources into **Stabilize → Connect → Sustain** phases with phones, hours, and intake links.
3. **Print** — Export the plan from the care plan tab.

Use **Sample** to load a worked example profile instantly.

## Data

| File | Purpose |
|------|---------|
| `src/data/resources.ts` | 17 starter county orgs (verify before real-world use) |
| `src/data/intake.ts` | Schema-driven de-identified intake template |
| `src/lib/matcher.ts` | Need derivation → eligibility → scoring → phasing |

## Design

Warm coastal palette, Nunito + Baloo 2, soft rounded cards, 48px+ tap targets for phone/tablet.

## Roadmap

- Expand resource database (211 export, county provider directory)
- Admin CRUD for resources
- PDF export with branding
- Optional encrypted storage for saved de-identified profiles

## Archived prototypes

Earlier explorations (Guided Journey, Command Center) remain in `src/prototypes/` for reference.
