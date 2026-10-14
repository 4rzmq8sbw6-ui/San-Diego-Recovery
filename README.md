# Wayfinder SD

A de-identified care-plan wizard for San Diego County. Check a profile with no names or identifiers, and Wayfinder orders the county resources to call, with phones, hours, and intake links.

Live: https://san-diego-recovery.pages.dev

## Run locally

```bash
cd ~/"kevs project"
npm install
npm run dev
```

## What is in here

| Path | Purpose |
|------|---------|
| `src/components/county-resource-plan/` | Wayfinder screens |
| `src/lib/county-resource-plan/` | The 25-program directory and the matcher |
| `src/styles/county-plan.css` | Wayfinder look |
| `scripts/county-plan-selfcheck.ts` | Checks the sample plan order |

Earlier cream-palette prototypes remain in `src/components/CarePlanBuilder.tsx` and `src/prototypes/`. The app entry now renders Wayfinder.
