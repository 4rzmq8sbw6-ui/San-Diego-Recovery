/**
 * The matching engine, shared by all three prototypes.
 *
 * Pipeline:
 *   intake state  ->  derived needs (with severity)
 *                 ->  eligibility filter (hard gates)
 *                 ->  fit score (needs × severity + access bonuses)
 *                 ->  phased sequence (Stabilize → Connect → Sustain)
 */

import { RESOURCES } from "@/data/resources";
import type { IntakeState } from "@/data/intake";
import type { NeedTag, Phase, Resource } from "@/data/types";

export type Severity = 1 | 2 | 3;

export type DerivedNeed = {
  tag: NeedTag;
  severity: Severity;
  label: string;
  reason: string;
};

export type MatchFlag = { tone: "info" | "caution"; text: string };

export type ResourceMatch = {
  resource: Resource;
  score: number;
  matchedNeeds: NeedTag[];
  flags: MatchFlag[];
  eligible: boolean;
  blockReason?: string;
};

export type PlanPhase = {
  phase: Phase;
  title: string;
  subtitle: string;
  matches: ResourceMatch[];
};

export type CarePlan = {
  needs: DerivedNeed[];
  headline?: { tone: "safety" | "priority"; text: string };
  matches: ResourceMatch[];
  excluded: ResourceMatch[];
  phases: PlanPhase[];
};

export const NEED_LABELS: Record<NeedTag, string> = {
  "immediate-crisis": "Immediate crisis support",
  suicidality: "Safety / suicide risk",
  "active-intoxication": "Sobering / intoxication",
  "withdrawal-management": "Withdrawal management (detox)",
  "substance-treatment": "Substance use treatment",
  "opioid-mat": "Medication for opioid use (MAT)",
  "mental-health-treatment": "Mental health care",
  "severe-mental-illness": "Severe mental illness support",
  shelter: "Emergency shelter",
  "housing-stability": "Housing stability",
  food: "Food",
  identification: "ID & vital documents",
  "day-services": "Day services",
};

const PHASE_META: Record<Phase, { order: number; title: string; subtitle: string }> = {
  stabilize: {
    order: 0,
    title: "Stabilize",
    subtitle: "Safety, sobering, a bed, and food — right now.",
  },
  connect: {
    order: 1,
    title: "Connect",
    subtitle: "Treatment, medication, and the documents to unlock the rest.",
  },
  sustain: {
    order: 2,
    title: "Sustain",
    subtitle: "Ongoing care and stable housing for the long haul.",
  },
};

function str(state: IntakeState, key: string): string | undefined {
  const v = state[key];
  return typeof v === "string" ? v : undefined;
}
function arr(state: IntakeState, key: string): string[] {
  const v = state[key];
  return Array.isArray(v) ? v : [];
}
function num(state: IntakeState, key: string): number | undefined {
  const v = state[key];
  return typeof v === "number" ? v : undefined;
}

/** Turn the filled template into a prioritized list of needs. */
export function deriveNeeds(state: IntakeState): DerivedNeed[] {
  const needs: DerivedNeed[] = [];
  const push = (tag: NeedTag, severity: Severity, reason: string) =>
    needs.push({ tag, severity, label: NEED_LABELS[tag], reason });

  const substances = arr(state, "substances").filter((s) => s !== "none");
  const currentlyUsing = str(state, "currentlyUsing") === "yes";
  const withdrawal = str(state, "withdrawal");
  const duration = str(state, "usageDuration");

  if (str(state, "suicidality") === "yes") {
    push("suicidality", 3, "Active safety risk reported.");
    push("immediate-crisis", 3, "Needs immediate crisis contact.");
  }

  if (currentlyUsing && substances.length) {
    push("active-intoxication", 2, "Currently using — sobering support may apply.");
  }

  if (withdrawal === "moderate" || withdrawal === "severe") {
    push(
      "withdrawal-management",
      withdrawal === "severe" ? 3 : 2,
      `${withdrawal === "severe" ? "Severe" : "Moderate"} withdrawal risk — detox likely needed.`,
    );
  }

  if (substances.length) {
    const longterm = duration === "over-10y" || duration === "5-10y";
    push(
      "substance-treatment",
      longterm ? 3 : 2,
      `Substance use (${substances.join(", ")})${longterm ? ", long-term" : ""}.`,
    );
    if (substances.some((s) => s === "opioids" || s === "heroin")) {
      push("opioid-mat", 3, "Opioid use — MAT is the standard of care.");
    }
  }

  const mh = arr(state, "mentalHealth").filter((s) => s !== "none");
  if (str(state, "severeMI") === "yes") {
    push("severe-mental-illness", 3, "Severe / persistent mental illness reported.");
    push("mental-health-treatment", 3, "Needs equipped mental health care.");
  } else if (mh.length) {
    push("mental-health-treatment", 2, `Mental health diagnoses: ${mh.join(", ")}.`);
  }

  const housing = str(state, "housing");
  if (housing === "unsheltered") {
    push("shelter", 3, "Currently unsheltered.");
    push("day-services", 1, "Day services help meet immediate basic needs.");
  } else if (housing === "shelter") {
    push("shelter", 2, "In emergency shelter — bridge to stability.");
  }
  if (
    housing &&
    housing !== "housed-stable" &&
    housing !== "unsheltered"
  ) {
    push("housing-stability", 2, "Housing is unstable.");
  } else if (housing === "unsheltered") {
    push("housing-stability", 3, "No stable housing.");
  }

  if (str(state, "foodInsecure") === "yes") {
    push("food", 2, "Food insecurity reported.");
  }

  const docs = arr(state, "documentsHave");
  if (str(state, "needsDocuments") === "yes" || (!docs.includes("id") && docs.length === 0)) {
    push("identification", docs.length === 0 ? 2 : 1, "Missing vital documents / ID.");
  }

  // De-duplicate, keeping the highest severity per tag.
  const byTag = new Map<NeedTag, DerivedNeed>();
  for (const n of needs) {
    const prev = byTag.get(n.tag);
    if (!prev || n.severity > prev.severity) byTag.set(n.tag, n);
  }
  return [...byTag.values()].sort((a, b) => b.severity - a.severity);
}

function genderToken(state: IntakeState): "men" | "women" | null {
  const g = str(state, "gender");
  if (g === "man") return "men";
  if (g === "woman") return "women";
  return null;
}

function evaluateResource(
  resource: Resource,
  state: IntakeState,
  needs: DerivedNeed[],
): ResourceMatch {
  const needSeverity = new Map(needs.map((n) => [n.tag, n.severity]));
  const matchedNeeds = resource.addresses.filter((tag) => needSeverity.has(tag));

  let score = 0;
  for (const tag of matchedNeeds) {
    score += (needSeverity.get(tag) ?? 1) * 10;
  }

  const flags: MatchFlag[] = [];
  const el = resource.eligibility;
  const currentlyUsing = str(state, "currentlyUsing") === "yes";
  const age = num(state, "age");

  // ---- Access bonuses -------------------------------------------------
  const transport = str(state, "transportation");
  if ((transport === "none" || transport === "limited") && resource.walkIn) score += 5;
  if (resource.walkIn) score += 2;
  if (el.cost === "free") score += 2;
  if (currentlyUsing && el.acceptsActiveUse) score += 3;
  if (el.referralRequired) score -= 2;

  // Avoid re-referring to a service they're already in (mild nudge).
  const priorServices = arr(state, "priorServices");
  if (resource.categories.some((c) => priorServices.includes(c))) score -= 1;

  // ---- Hard eligibility gates ----------------------------------------
  let eligible = true;
  let blockReason: string | undefined;

  if (el.minAge && age !== undefined && age < el.minAge) {
    eligible = false;
    blockReason = `Serves ages ${el.minAge}+`;
  }
  if (el.maxAge && age !== undefined && age > el.maxAge) {
    eligible = false;
    blockReason = `Serves up to age ${el.maxAge}`;
  }
  if (el.sobrietyRequired && currentlyUsing) {
    eligible = false;
    blockReason = "Requires sobriety to enter";
  }
  const gt = genderToken(state);
  if (
    gt &&
    el.genders &&
    !el.genders.includes("any") &&
    !el.genders.includes(gt) &&
    !el.genders.includes("families")
  ) {
    eligible = false;
    blockReason = `Serves ${el.genders.join(" / ")} only`;
  }

  // ---- Advisory flags (do not exclude) -------------------------------
  if (el.faithBased) flags.push({ tone: "info", text: "Faith-based program" });
  if (el.referralRequired)
    flags.push({ tone: "caution", text: "Entry by referral (call 2-1-1 / CES first)" });
  if (
    resource.categories.includes("detox") &&
    el.medicalDetoxCapable === false &&
    str(state, "withdrawal") === "severe"
  ) {
    flags.push({
      tone: "caution",
      text: "Severe withdrawal may need a medically managed detox — confirm safety first",
    });
  }
  if (el.petsAllowed) flags.push({ tone: "info", text: "Pets welcome" });

  return { resource, score, matchedNeeds, flags, eligible, blockReason };
}

export function buildPlan(state: IntakeState): CarePlan {
  const needs = deriveNeeds(state);

  const evaluated = RESOURCES.map((r) => evaluateResource(r, state, needs)).filter(
    (m) => m.matchedNeeds.length > 0,
  );

  const eligible = evaluated
    .filter((m) => m.eligible)
    .sort((a, b) => b.score - a.score);
  const excluded = evaluated.filter((m) => !m.eligible);

  const phases: PlanPhase[] = (["stabilize", "connect", "sustain"] as Phase[])
    .map((phase) => {
      const meta = PHASE_META[phase];
      const matches = eligible
        .filter((m) => m.resource.phase === phase)
        .sort((a, b) => b.score - a.score);
      return { phase, title: meta.title, subtitle: meta.subtitle, matches };
    })
    .filter((p) => p.matches.length > 0);

  let headline: CarePlan["headline"];
  if (needs.some((n) => n.tag === "suicidality")) {
    headline = {
      tone: "safety",
      text: "Safety first — call or text 988 (or 1-888-724-7240) before anything else.",
    };
  } else if (needs.some((n) => n.severity === 3)) {
    headline = {
      tone: "priority",
      text: "High-severity needs detected. Start with the Stabilize steps below.",
    };
  }

  return { needs, headline, matches: eligible, excluded, phases };
}

export function telHref(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  return digits ? `tel:${digits}` : "#";
}

export function isEmail(value: string): boolean {
  return /@/.test(value);
}
