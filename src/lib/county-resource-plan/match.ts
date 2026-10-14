import {
  AGE_OPTIONS,
  DURATION_OPTIONS,
  FAMILY_OPTIONS,
  FOOD_OPTIONS,
  GENDER_OPTIONS,
  HOUSING_OPTIONS,
  REGION_OPTIONS,
  labelFor,
} from "@/lib/county-resource-plan/options";
import { COUNTY_RESOURCES } from "@/lib/county-resource-plan/resources";
import type {
  CountyResource,
  NeedId,
  PersonProfile,
  PlanPhase,
  PlanStep,
  ResourceLocation,
  ResourcePlan,
} from "@/lib/county-resource-plan/types";

const PHASE_ORDER: PlanPhase[] = ["now", "today", "this-week", "stabilize"];

const NEED_PHASE: Record<NeedId, PlanPhase> = {
  "medical-emergency": "now",
  crisis: "now",
  violence: "now",
  sobering: "now",
  detox: "today",
  shelter: "today",
  "food-now": "today",
  family: "today",
  day: "today",
  treatment: "this-week",
  benefits: "this-week",
  documents: "this-week",
  "primary-care": "this-week",
  transport: "this-week",
  older: "this-week",
  veteran: "this-week",
  housing: "stabilize",
  "frequent-911": "stabilize",
};

const NEED_SCORE: Record<NeedId, number> = {
  "medical-emergency": 200,
  crisis: 90,
  violence: 74,
  sobering: 88,
  shelter: 80,
  "food-now": 78,
  family: 76,
  detox: 72,
  day: 54,
  benefits: 50,
  documents: 48,
  "primary-care": 46,
  treatment: 44,
  veteran: 42,
  older: 40,
  transport: 36,
  housing: 34,
  "frequent-911": 30,
};

const PHASE_LIMIT: Record<PlanPhase, number> = {
  now: 4,
  today: 5,
  "this-week": 7,
  stabilize: 4,
};

const NEED_LABEL: Record<NeedId, string> = {
  "medical-emergency": "Medical emergency",
  crisis: "Crisis",
  violence: "Safety risk",
  sobering: "Sobering",
  detox: "Detox",
  treatment: "Treatment",
  shelter: "Shelter",
  day: "Day center",
  housing: "Housing",
  "food-now": "Food today",
  benefits: "Benefits",
  documents: "Documents",
  "primary-care": "Clinic",
  transport: "Transportation",
  older: "Older adult",
  veteran: "Veteran",
  "frequent-911": "Frequent 911",
  family: "Family",
};

interface PersonNeed {
  id: NeedId;
  why: string;
}

function has(list: string[], id: string): boolean {
  return list.includes(id);
}

function concrete(list: string[]): string[] {
  return list.filter((id) => id !== "none" && id !== "not-asked");
}

function earliestPhase(needs: NeedId[]): PlanPhase {
  return (
    PHASE_ORDER.find((phase) => needs.some((need) => NEED_PHASE[need] === phase)) ?? "stabilize"
  );
}

function personNeeds(profile: PersonProfile): PersonNeed[] {
  const needs: PersonNeed[] = [];
  const add = (id: NeedId, why: string) => {
    if (!needs.some((need) => need.id === id)) needs.push({ id, why });
  };

  const severeWithdrawal =
    has(profile.urgency, "severe-withdrawal") || has(profile.usePattern, "severe-withdrawal");
  const overdose = has(profile.urgency, "overdose");
  const medicalEmergency =
    has(profile.urgency, "medical-emergency") || overdose || severeWithdrawal;
  if (medicalEmergency) {
    add("medical-emergency", "There is a medical emergency, an overdose, or severe withdrawal.");
  }

  const severePsych = concrete(profile.severeMentalHealth);
  const behavioralCrisis =
    has(profile.urgency, "suicide") ||
    has(profile.urgency, "psychosis") ||
    has(profile.urgency, "cant-care") ||
    has(profile.urgency, "violence") ||
    severePsych.length > 0 ||
    overdose ||
    severeWithdrawal;
  if (behavioralCrisis) {
    add("crisis", "There is a behavioral health or substance crisis today.");
  }

  if (has(profile.urgency, "violence") || has(profile.severeMentalHealth, "aggression")) {
    add("violence", "Violence or a safety risk is part of this contact.");
  }

  if (has(profile.urgency, "intoxicated") || has(profile.usePattern, "intoxicated-now")) {
    add("sobering", "They are intoxicated now and need a safe place to sober up.");
  }

  const wantsStop = has(profile.usePattern, "wants-stop");
  const wantsMat = has(profile.usePattern, "wants-mat");
  const notInterested = has(profile.usePattern, "not-interested");
  const withdrawal =
    has(profile.usePattern, "withdrawal") ||
    has(profile.usePattern, "severe-withdrawal") ||
    has(profile.urgency, "severe-withdrawal");
  if (!notInterested && (wantsStop || wantsMat || withdrawal)) {
    add(
      "treatment",
      "They are using substances and are open to treatment, or they are in withdrawal.",
    );
  }
  if (!notInterested && (wantsStop || withdrawal)) {
    add("detox", "They want to stop, or withdrawal has started, so a detox bed is worth a call.");
  }

  const unstableHousing =
    profile.housingType === "unsheltered" ||
    profile.housingType === "vehicle" ||
    profile.housingType === "motel" ||
    profile.housingType === "doubled-up" ||
    profile.housingType === "losing-housing" ||
    has(profile.housingNotes, "no-place-tonight") ||
    has(profile.housingNotes, "eviction") ||
    has(profile.urgency, "no-shelter-tonight");
  if (unstableHousing) {
    add("shelter", "They do not have a safe, stable place to stay.");
    add("day", "They need a daytime place with a bathroom, a phone, or somewhere to be.");
    add("housing", "Housing navigation belongs on the plan after tonight is settled.");
  } else if (profile.housingType === "shelter") {
    add("day", "They are in shelter and still need daytime services.");
    add("housing", "They are in shelter and still need a path out of it.");
  } else if (has(profile.housingNotes, "waitlist") || has(profile.housingNotes, "ces-enrolled")) {
    add("housing", "They already have a housing record. Update it instead of starting over.");
  }

  if (has(profile.social, "children-in-care") && unstableHousing) {
    add("family", "Children are with them, so the bed has to work for a family.");
  }

  if (profile.food === "none-today" || has(profile.urgency, "no-food")) {
    add("food-now", "They have not eaten today.");
    add("benefits", "Food is unstable, so CalFresh belongs on this week's list.");
  } else if (profile.food === "skips-meals") {
    add("benefits", "They skip meals often enough that CalFresh is worth starting.");
  }

  if (has(profile.income, "none") || has(profile.documentsMissing, "medi-cal")) {
    add("benefits", "Income or insurance is missing, so Medi-Cal and CalFresh should be started.");
  }

  const missingPapers = ["photo-id", "birth-certificate", "ss-card"].filter((id) =>
    has(profile.documentsMissing, id),
  );
  if (missingPapers.length > 0) {
    add("documents", "An ID or vital record is missing and will block later appointments.");
  }

  if (concrete(profile.medical).length > 0 || wantsMat) {
    add(
      "primary-care",
      "A clinic visit is safer than another emergency-room cycle for this medical need.",
    );
  }

  const transportBarrier = ["no-fare", "cannot-walk-far", "wheelchair", "no-ride-today"].some(
    (id) => has(profile.transportation, id),
  );
  if (transportBarrier) {
    add("transport", "They cannot reliably get to the next appointment on their own.");
  }

  const disability = concrete(profile.cognitive).length > 0 || has(profile.medical, "mobility");
  if (profile.ageBand === "65-plus" || (profile.ageBand === "55-64" && disability)) {
    add("older", "Age or a disability makes Aging & Independence Services a fit.");
  }

  if (profile.veteran === "yes") {
    add("veteran", "They are a veteran, so veteran-specific help comes before a generic line.");
  }

  if (has(profile.urgency, "frequent-911")) {
    add("frequent-911", "They use 911 often. Loop in the fire department's follow-up team.");
  }

  return needs;
}

function ageBlock(resource: CountyResource, profile: PersonProfile): string | null {
  if (!profile.ageBand) return null;
  if (resource.ages === "18-plus" && profile.ageBand === "under-18") {
    return "Serves adults 18 and older.";
  }
  if (resource.ages === "under-18" && profile.ageBand !== "under-18") {
    return "Serves children and youth under 18.";
  }
  if (resource.ages === "older-adults") {
    const older = profile.ageBand === "65-plus" || profile.ageBand === "55-64";
    const disability = concrete(profile.cognitive).length > 0 || has(profile.medical, "mobility");
    if (!older && !disability) return "Aimed at older adults and people with disabilities.";
  }
  return null;
}

function genderBlock(resource: CountyResource, profile: PersonProfile): string | null {
  if (resource.genders === "any" || !profile.gender || profile.gender === "unasked") return null;
  if (
    resource.genders === "women" &&
    (profile.gender === "man" || profile.gender === "trans-man")
  ) {
    return "This program is listed for women.";
  }
  if (
    resource.genders === "men" &&
    (profile.gender === "woman" || profile.gender === "trans-woman")
  ) {
    return "This program is listed for men.";
  }
  return null;
}

function faithBlock(resource: CountyResource, profile: PersonProfile): string | null {
  if (resource.faith === "faith-required" && profile.faith === "no-faith-based") {
    return "Faith participation is required, and they will not go to a faith-based program.";
  }
  return null;
}

function regionFits(resource: CountyResource, profile: PersonProfile): boolean {
  if (resource.regions.includes("countywide") || !profile.region) return true;
  return resource.regions.includes(profile.region);
}

function eligibleLocations(resource: CountyResource, profile: PersonProfile): ResourceLocation[] {
  const locations = resource.locations ?? [];
  if (profile.ageBand === "under-18") {
    const youth = locations.filter((location) => location.serves === "under-18");
    if (youth.length > 0) return youth;
  }
  return locations.filter((location) => location.serves !== "under-18");
}

function chooseLocation(
  resource: CountyResource,
  profile: PersonProfile,
): { location?: ResourceLocation; alternates: ResourceLocation[] } {
  const pool = eligibleLocations(resource, profile);
  if (pool.length === 0) return { alternates: [] };
  const woman = profile.gender === "woman" || profile.gender === "trans-woman";
  const inRegion = profile.region
    ? pool.filter((location) => location.region === profile.region)
    : [];
  let location: ResourceLocation | undefined;
  if (inRegion.length > 0) {
    location =
      (woman ? inRegion.find((item) => item.serves === "women") : undefined) ?? inRegion[0];
  } else if (resource.fallbackLocationId) {
    location = pool.find((item) => item.id === resource.fallbackLocationId);
  }
  const alternates = pool.filter((item) => item.id !== location?.id);
  return { location, alternates };
}

function cautionsFor(resource: CountyResource, profile: PersonProfile): string[] {
  const cautions: string[] = [];
  if (profile.faith === "no-faith-based" && resource.faith === "faith-affiliated") {
    cautions.push(
      "They said they will not use a faith-based program. Ask if this service requires a religious activity before you send them.",
    );
  } else if (profile.faith === "secular-preferred" && resource.faith === "faith-affiliated") {
    cautions.push(
      "They prefer a program that is not faith-based. Ask what, if anything, is required.",
    );
  }
  if (
    (profile.gender === "trans-woman" ||
      profile.gender === "nonbinary" ||
      profile.gender === "another") &&
    resource.genders === "women"
  ) {
    cautions.push(
      "Confirm the program's gender policy before transport. The public page does not state it.",
    );
  }
  const onMat = has(profile.medications, "methadone") || has(profile.medications, "buprenorphine");
  if (
    onMat &&
    (resource.services.includes("detox") || resource.services.includes("residential-sud"))
  ) {
    cautions.push(
      "They are on methadone or buprenorphine. Ask intake if the program continues it. Do not tell them to stop.",
    );
  }
  const severeWithdrawal =
    has(profile.usePattern, "severe-withdrawal") || has(profile.urgency, "severe-withdrawal");
  if (severeWithdrawal && resource.sobriety === "expected-during-stay") {
    cautions.push(
      "Severe withdrawal needs an emergency department first. This detox is non-medical.",
    );
  }
  if (has(profile.medical, "dialysis") && resource.services.includes("residential-sud")) {
    cautions.push("They are on dialysis. Confirm the program can keep that schedule.");
  }
  if (has(profile.medical, "pregnancy") && resource.id === "mcalister-detox") {
    cautions.push("They are pregnant. Ask about Kiva women's detox before a general detox bed.");
  }
  if (has(profile.housingNotes, "shelter-ban") && resource.services.includes("shelter")) {
    cautions.push(
      "They are banned from a shelter. Name that site. A ban at one place is not a ban everywhere.",
    );
  }
  if (has(profile.housingNotes, "ces-enrolled") && resource.matches.includes("housing")) {
    cautions.push(
      "They are already in coordinated entry or HMIS. Ask the worker to update that record.",
    );
  }
  if (profile.ageBand === "under-18" && resource.id === "211") {
    cautions.push("Say they are under 18 and ask for a youth bed.");
  }
  return cautions;
}

function scoreFor(
  resource: CountyResource,
  profile: PersonProfile,
  matched: NeedId[],
  location?: ResourceLocation,
): number {
  const weights = matched.map((need) => NEED_SCORE[need]);
  let score = Math.max(...weights) + (weights.length - 1) * 4;
  if (location && profile.region && location.region === profile.region) score += 12;
  else if (profile.region && resource.regions.includes(profile.region)) score += 6;
  if (profile.faith === "no-faith-based" && resource.faith === "faith-affiliated") score -= 20;
  if (profile.faith === "secular-preferred" && resource.faith === "faith-affiliated") score -= 8;
  if (has(profile.medical, "pregnancy") && resource.id === "mcalister-kiva") score += 24;
  if (has(profile.documentsMissing, "phone") && resource.id === "neil-good-day-center") score += 8;
  if (has(profile.social, "children-in-care") && resource.id === "father-joes") score += 10;
  if (has(profile.usePattern, "wants-mat") && resource.services.includes("outpatient-sud"))
    score += 4;
  if (has(profile.transportation, "no-ride-today") && resource.id === "fact") score += 8;
  if (resource.id === "acl" && matched.includes("crisis")) score += 20;
  return score;
}

function planNotes(profile: PersonProfile): string[] {
  const notes: string[] = [];
  if (concrete(profile.cognitive).length > 0 || has(profile.cognitive, "reading")) {
    notes.push("Write the phone number and the next step on paper. Ask them to repeat it back.");
  }
  if (has(profile.documentsMissing, "phone")) {
    notes.push("They have no working phone. Place the important calls with them before you leave.");
  }
  if (has(profile.familyOrigin, "violence")) {
    notes.push("Do not insist on a family callback. Ask who is actually safe to call.");
  } else if (has(profile.familyOrigin, "supportive")) {
    notes.push("A supportive family member can be the callback person if the person agrees.");
  }
  if (has(profile.usePattern, "not-interested")) {
    notes.push(
      "They are not interested in treatment today. Lead with safety, food, and a bed. Leave treatment as an open door.",
    );
  } else if (
    concrete(profile.substances).length > 0 &&
    !has(profile.usePattern, "wants-stop") &&
    !has(profile.usePattern, "wants-mat") &&
    !has(profile.usePattern, "withdrawal") &&
    !has(profile.usePattern, "severe-withdrawal")
  ) {
    notes.push(
      "Substance use is checked, and interest in treatment is blank. Ask before you call a detox bed.",
    );
  }
  if (
    has(profile.urgency, "frequent-911") &&
    (profile.region === "north-coastal" || profile.region === "north-inland")
  ) {
    notes.push(
      "SDFD Resource Access Program covers the City of San Diego. North County is a different fire department. 211 and 988 still apply.",
    );
  }
  if (has(profile.medical, "pregnancy")) {
    notes.push(
      "Pregnancy changes which detox and which shelter are safe. Say it on every intake call.",
    );
  }
  if (profile.ageBand === "under-18") {
    notes.push(
      "Under 18: adult shelters and adult detox are the wrong door. Use 988, the youth crisis unit, and 2-1-1.",
    );
  }
  return notes;
}

function planGaps(profile: PersonProfile, needs: PersonNeed[]): string[] {
  const gaps: string[] = [];
  if (!profile.ageBand)
    gaps.push("Age is blank, so youth and adult programs are both still possible.");
  if (!profile.gender)
    gaps.push("Gender is blank, so programs limited to women or men are not ranked yet.");
  if (!profile.region) gaps.push("Region is blank, so the plan starts with countywide lines.");
  if (!profile.housingType && !has(profile.urgency, "no-shelter-tonight")) {
    gaps.push("Housing is blank, so a shelter bed is not ranked.");
  }
  if (profile.substances.length === 0) gaps.push("Substances are blank.");
  if (needs.length === 0) {
    gaps.push("Almost nothing urgent is checked. The list below is only a starting door.");
  }
  return gaps;
}

function safetyBanner(profile: PersonProfile): string | null {
  if (
    has(profile.urgency, "medical-emergency") ||
    has(profile.urgency, "overdose") ||
    has(profile.urgency, "severe-withdrawal") ||
    has(profile.usePattern, "severe-withdrawal")
  ) {
    return "Call 911 before any other number. A detox bed or a shelter is not the first stop for an overdose or severe withdrawal.";
  }
  return null;
}

function consider(
  resource: CountyResource,
  profile: PersonProfile,
  needs: PersonNeed[],
): { ruledOut?: string; step?: PlanStep } | null {
  if (resource.planRole !== "primary") return null;
  const have = new Set(needs.map((need) => need.id));
  if (resource.matchAll?.some((need) => !have.has(need))) return null;
  const matched = resource.matches.filter((need) => have.has(need));
  if (matched.length === 0) return null;
  if (resource.genders !== "any" && (!profile.gender || profile.gender === "unasked")) return null;

  const blocked =
    ageBlock(resource, profile) ??
    genderBlock(resource, profile) ??
    faithBlock(resource, profile) ??
    (resource.veteransOnly && profile.veteran === "no"
      ? "Serves veterans and their families."
      : null);
  if (blocked) return { ruledOut: blocked };
  if (!regionFits(resource, profile)) return null;

  const { location, alternates } = chooseLocation(resource, profile);
  const why = needs.filter((need) => matched.includes(need.id)).map((need) => need.why);
  const step: PlanStep = {
    resource,
    location,
    alternates,
    phase: earliestPhase(matched),
    why,
    cautions: cautionsFor(resource, profile),
    score: scoreFor(resource, profile, matched, location),
  };
  return { step };
}

export function buildPlan(profile: PersonProfile): ResourcePlan {
  const needs = personNeeds(profile);
  const steps: PlanStep[] = [];
  const alreadyConnected: PlanStep[] = [];
  const ruledOut: { name: string; reason: string }[] = [];
  const prior = new Set(concrete(profile.priorServices));

  for (const resource of COUNTY_RESOURCES) {
    const result = consider(resource, profile, needs);
    if (!result) continue;
    if (result.ruledOut) {
      ruledOut.push({ name: resource.name, reason: result.ruledOut });
      continue;
    }
    if (!result.step) continue;
    if (prior.has(resource.id)) alreadyConnected.push(result.step);
    else steps.push(result.step);
  }

  const ranked = PHASE_ORDER.flatMap((phase) =>
    steps
      .filter((step) => step.phase === phase)
      .sort((a, b) => b.score - a.score || a.resource.name.localeCompare(b.resource.name))
      .slice(0, PHASE_LIMIT[phase]),
  );

  if (ranked.length === 0 && alreadyConnected.length === 0) {
    const door = COUNTY_RESOURCES.find((resource) => resource.id === "211");
    if (door) {
      ranked.push({
        resource: door,
        alternates: [],
        phase: "today",
        why: [
          "Not enough is checked to rank a full plan. 2-1-1 can start the search for any basic need.",
        ],
        cautions: [],
        score: 1,
      });
    }
  }

  alreadyConnected.sort(
    (a, b) => b.score - a.score || a.resource.name.localeCompare(b.resource.name),
  );

  return {
    steps: ranked,
    needs: needs.map((need) => ({
      id: need.id,
      label: NEED_LABEL[need.id],
      reason: need.why,
      severity: (NEED_PHASE[need.id] === "now" ? 3 : NEED_PHASE[need.id] === "today" ? 2 : 1) as
        | 1
        | 2
        | 3,
    })),
    alreadyConnected,
    ruledOut,
    safety: safetyBanner(profile),
    notes: planNotes(profile),
    gaps: planGaps(profile, needs),
  };
}

export function profileHeadline(profile: PersonProfile): string {
  const age = labelFor(AGE_OPTIONS, profile.ageBand);
  const gender = labelFor(GENDER_OPTIONS, profile.gender);
  const region = labelFor(REGION_OPTIONS, profile.region);
  const housing = labelFor(HOUSING_OPTIONS, profile.housingType);
  return [age, gender, region, housing].filter((part) => part !== "Not answered").join(" · ");
}

export const PHASE_LABELS: Record<PlanPhase, { title: string; detail: string }> = {
  now: { title: "Right now", detail: "Do these before transport anywhere else." },
  today: {
    title: "Today",
    detail: "Bed, food, sobering, and the calls that cannot wait until tomorrow.",
  },
  "this-week": {
    title: "This week",
    detail: "Benefits, documents, a clinic, and treatment intake.",
  },
  stabilize: {
    title: "Then stabilize",
    detail: "Housing navigation and crew follow-up after tonight is safe.",
  },
};

export function describePerson(profile: PersonProfile): string[] {
  const lines: string[] = [];
  const push = (label: string, value: string) => {
    if (value && value !== "Not answered") lines.push(`${label}: ${value}`);
  };
  push("Age", labelFor(AGE_OPTIONS, profile.ageBand));
  push("Gender", labelFor(GENDER_OPTIONS, profile.gender));
  push("Region", labelFor(REGION_OPTIONS, profile.region));
  push("Housing", labelFor(HOUSING_OPTIONS, profile.housingType));
  push("Food", labelFor(FOOD_OPTIONS, profile.food));
  push("How long using", labelFor(DURATION_OPTIONS, profile.substanceDuration));
  if (concrete(profile.familyOrigin).length > 0) {
    push(
      "Family",
      concrete(profile.familyOrigin)
        .map((id) => FAMILY_OPTIONS.find((option) => option.id === id)?.label ?? id)
        .join(", "),
    );
  }
  return lines;
}
