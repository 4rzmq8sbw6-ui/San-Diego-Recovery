/**
 * De-identified intake template.
 *
 * NO PHI: no names, DOB, addresses, record numbers, or contact info. Only the
 * non-identifying attributes needed to match a person to the right services.
 *
 * The schema is data-driven so all three prototypes render the same questions
 * in their own layout, and the matcher reads a single flat state object.
 */

export type FieldKind = "number" | "single" | "multi" | "text";

export type FieldOption = {
  value: string;
  label: string;
  /** Optional helper shown under the option. */
  hint?: string;
};

export type IntakeField = {
  key: string;
  label: string;
  kind: FieldKind;
  help?: string;
  options?: FieldOption[];
  placeholder?: string;
  /** Optional units / suffix for number inputs. */
  suffix?: string;
};

export type IntakeSection = {
  id: string;
  title: string;
  blurb: string;
  /** lucide icon name is chosen in the UI layer, keyed by this. */
  icon: string;
  fields: IntakeField[];
};

const yesNo: FieldOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

export const INTAKE_SECTIONS: IntakeSection[] = [
  {
    id: "about",
    title: "About the person",
    blurb: "A few basics — no names or identifying details.",
    icon: "user-round",
    fields: [
      { key: "age", label: "Age", kind: "number", suffix: "yrs", placeholder: "e.g. 34" },
      {
        key: "gender",
        label: "Gender",
        kind: "single",
        options: [
          { value: "man", label: "Man" },
          { value: "woman", label: "Woman" },
          { value: "nonbinary", label: "Non-binary" },
          { value: "trans", label: "Transgender" },
          { value: "other", label: "Another identity" },
          { value: "prefer-not", label: "Prefer not to say" },
        ],
      },
    ],
  },
  {
    id: "substances",
    title: "Substance use",
    blurb: "What is being used, for how long, and where things stand today.",
    icon: "pill",
    fields: [
      {
        key: "substances",
        label: "Substances used",
        kind: "multi",
        options: [
          { value: "alcohol", label: "Alcohol" },
          { value: "meth", label: "Methamphetamine" },
          { value: "opioids", label: "Fentanyl / opioids" },
          { value: "heroin", label: "Heroin" },
          { value: "cocaine", label: "Cocaine / crack" },
          { value: "benzos", label: "Benzodiazepines" },
          { value: "cannabis", label: "Cannabis" },
          { value: "none", label: "None" },
        ],
      },
      {
        key: "primarySubstance",
        label: "Primary substance",
        kind: "single",
        options: [
          { value: "alcohol", label: "Alcohol" },
          { value: "meth", label: "Meth" },
          { value: "opioids", label: "Fentanyl / opioids" },
          { value: "heroin", label: "Heroin" },
          { value: "cocaine", label: "Cocaine" },
          { value: "benzos", label: "Benzodiazepines" },
          { value: "other", label: "Other" },
        ],
      },
      {
        key: "usageDuration",
        label: "How long using",
        kind: "single",
        options: [
          { value: "under-1y", label: "Under 1 year" },
          { value: "1-5y", label: "1–5 years" },
          { value: "5-10y", label: "5–10 years" },
          { value: "over-10y", label: "Over 10 years" },
        ],
      },
      {
        key: "currentlyUsing",
        label: "Currently using",
        kind: "single",
        options: yesNo,
      },
      {
        key: "withdrawal",
        label: "Withdrawal risk",
        kind: "single",
        help: "Alcohol & benzo withdrawal can be medically dangerous — flag if severe.",
        options: [
          { value: "none", label: "None / minimal" },
          { value: "mild", label: "Mild" },
          { value: "moderate", label: "Moderate" },
          { value: "severe", label: "Severe (medical)" },
        ],
      },
      {
        key: "sobrietyReady",
        label: "Ready & willing to pursue sobriety",
        kind: "single",
        options: yesNo,
      },
    ],
  },
  {
    id: "mental-health",
    title: "Mental & cognitive health",
    blurb: "Diagnoses and any cognitive considerations.",
    icon: "brain",
    fields: [
      {
        key: "mentalHealth",
        label: "Mental health diagnoses",
        kind: "multi",
        options: [
          { value: "depression", label: "Depression" },
          { value: "anxiety", label: "Anxiety" },
          { value: "ptsd", label: "PTSD / trauma" },
          { value: "bipolar", label: "Bipolar" },
          { value: "schizophrenia", label: "Schizophrenia / psychosis" },
          { value: "personality", label: "Personality disorder" },
          { value: "none", label: "None known" },
        ],
      },
      {
        key: "severeMI",
        label: "Severe / persistent mental illness",
        kind: "single",
        help: "Ongoing condition that significantly impairs daily functioning.",
        options: yesNo,
      },
      {
        key: "suicidality",
        label: "Current suicidal thoughts / safety risk",
        kind: "single",
        options: yesNo,
      },
      {
        key: "cognitive",
        label: "Cognitive deficits",
        kind: "multi",
        options: [
          { value: "tbi", label: "Traumatic brain injury" },
          { value: "developmental", label: "Developmental / intellectual" },
          { value: "memory", label: "Memory / dementia" },
          { value: "processing", label: "Processing / learning" },
          { value: "none", label: "None known" },
        ],
      },
    ],
  },
  {
    id: "medical",
    title: "Medical",
    blurb: "Health conditions and prior medications.",
    icon: "stethoscope",
    fields: [
      {
        key: "medical",
        label: "Medical diagnoses",
        kind: "multi",
        options: [
          { value: "chronic-pain", label: "Chronic pain" },
          { value: "diabetes", label: "Diabetes" },
          { value: "heart", label: "Heart / hypertension" },
          { value: "liver", label: "Liver disease" },
          { value: "hiv-hep", label: "HIV / Hepatitis" },
          { value: "pregnancy", label: "Pregnancy" },
          { value: "mobility", label: "Mobility / disability" },
          { value: "none", label: "None known" },
        ],
      },
      {
        key: "priorMeds",
        label: "Previous medications taken",
        kind: "text",
        placeholder: "e.g. Suboxone (2023), sertraline…",
      },
    ],
  },
  {
    id: "stability",
    title: "Housing & daily stability",
    blurb: "Where they sleep, eat, and how they get around.",
    icon: "home",
    fields: [
      {
        key: "housing",
        label: "Housing type & stability",
        kind: "single",
        options: [
          { value: "unsheltered", label: "Unsheltered / on the street" },
          { value: "shelter", label: "Emergency shelter" },
          { value: "transitional", label: "Transitional / sober living" },
          { value: "doubled-up", label: "Doubled-up / couch surfing" },
          { value: "housed-unstable", label: "Housed but unstable" },
          { value: "housed-stable", label: "Housed & stable" },
        ],
      },
      {
        key: "foodInsecure",
        label: "Food insecurity",
        kind: "single",
        options: yesNo,
      },
      {
        key: "transportation",
        label: "Transportation",
        kind: "single",
        options: [
          { value: "none", label: "None" },
          { value: "limited", label: "Limited (transit only)" },
          { value: "reliable", label: "Reliable" },
        ],
      },
    ],
  },
  {
    id: "supports",
    title: "Supports, income & documents",
    blurb: "Social sphere, money, and vital records.",
    icon: "users-round",
    fields: [
      {
        key: "socialSupport",
        label: "Social sphere",
        kind: "single",
        options: [
          { value: "isolated", label: "Isolated" },
          { value: "some", label: "Some support" },
          { value: "strong", label: "Strong network" },
        ],
      },
      {
        key: "familyOrigin",
        label: "Family of origin (context)",
        kind: "text",
        placeholder: "e.g. estranged; supportive sister nearby…",
      },
      {
        key: "income",
        label: "Income & sources",
        kind: "multi",
        options: [
          { value: "none", label: "No income" },
          { value: "employment", label: "Employment" },
          { value: "ssi-ssdi", label: "SSI / SSDI" },
          { value: "ga", label: "General Relief / CalWORKs" },
          { value: "family", label: "Family support" },
          { value: "veterans", label: "Veteran benefits" },
        ],
      },
      {
        key: "documentsHave",
        label: "Vital documents on hand",
        kind: "multi",
        options: [
          { value: "id", label: "Photo ID" },
          { value: "ssc", label: "Social Security card" },
          { value: "birth-cert", label: "Birth certificate" },
          { value: "insurance", label: "Insurance / Medi-Cal card" },
        ],
      },
      {
        key: "needsDocuments",
        label: "Needs help getting documents",
        kind: "single",
        options: yesNo,
      },
    ],
  },
  {
    id: "history",
    title: "Service history",
    blurb: "What they've already been connected to.",
    icon: "history",
    fields: [
      {
        key: "priorServices",
        label: "Previously connected services",
        kind: "multi",
        options: [
          { value: "detox", label: "Detox" },
          { value: "residential", label: "Residential treatment" },
          { value: "outpatient", label: "Outpatient / IOP" },
          { value: "mat", label: "MAT" },
          { value: "mental-health", label: "Mental health care" },
          { value: "shelter", label: "Shelter" },
          { value: "housing", label: "Housing program" },
          { value: "none", label: "None" },
        ],
      },
    ],
  },
];

export type IntakeState = Record<string, string | string[] | number | undefined>;

export const ALL_FIELDS: IntakeField[] = INTAKE_SECTIONS.flatMap((s) => s.fields);

export function emptyIntake(): IntakeState {
  const state: IntakeState = {};
  for (const f of ALL_FIELDS) {
    state[f.key] = f.kind === "multi" ? [] : undefined;
  }
  return state;
}

/** Count of fields with a meaningful answer — used for progress meters. */
export function answeredCount(state: IntakeState): number {
  return ALL_FIELDS.reduce((n, f) => {
    const v = state[f.key];
    if (Array.isArray(v)) return n + (v.length ? 1 : 0);
    return n + (v !== undefined && v !== "" ? 1 : 0);
  }, 0);
}

/** A worked, de-identified example so reviewers can see the flow immediately. */
export function sampleIntake(): IntakeState {
  return {
    ...emptyIntake(),
    age: 41,
    gender: "man",
    substances: ["opioids", "meth", "alcohol"],
    primarySubstance: "opioids",
    usageDuration: "over-10y",
    currentlyUsing: "yes",
    withdrawal: "moderate",
    sobrietyReady: "yes",
    mentalHealth: ["depression", "ptsd"],
    severeMI: "no",
    suicidality: "no",
    cognitive: ["none"],
    medical: ["chronic-pain", "hiv-hep"],
    priorMeds: "Suboxone (2022, stopped)",
    housing: "unsheltered",
    foodInsecure: "yes",
    transportation: "none",
    socialSupport: "isolated",
    familyOrigin: "Estranged from family; one supportive cousin",
    income: ["none"],
    documentsHave: [],
    needsDocuments: "yes",
    priorServices: ["detox", "mat"],
  };
}
