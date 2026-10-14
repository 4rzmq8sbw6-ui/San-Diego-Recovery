import type {
  AgeBand,
  CountyRegion,
  FaithPreference,
  FoodSituation,
  GenderId,
  HousingType,
  SubstanceDuration,
} from "@/lib/county-resource-plan/types";

export interface Choice {
  id: string;
  label: string;
  hint?: string;
  /** Selecting this clears the other boxes in the group. */
  exclusive?: boolean;
}

export const AGE_OPTIONS: { id: AgeBand; label: string }[] = [
  { id: "under-18", label: "Under 18" },
  { id: "18-24", label: "18–24" },
  { id: "25-39", label: "25–39" },
  { id: "40-54", label: "40–54" },
  { id: "55-64", label: "55–64" },
  { id: "65-plus", label: "65 or older" },
];

export const GENDER_OPTIONS: { id: GenderId; label: string }[] = [
  { id: "woman", label: "Woman" },
  { id: "man", label: "Man" },
  { id: "trans-woman", label: "Transgender woman" },
  { id: "trans-man", label: "Transgender man" },
  { id: "nonbinary", label: "Nonbinary" },
  { id: "another", label: "Another gender" },
  { id: "unasked", label: "Not asked" },
];

export const VETERAN_OPTIONS: { id: "yes" | "no" | "unasked"; label: string }[] = [
  { id: "yes", label: "Veteran" },
  { id: "no", label: "Not a veteran" },
  { id: "unasked", label: "Not asked" },
];

export const REGION_OPTIONS: { id: CountyRegion; label: string; hint: string }[] = [
  {
    id: "central",
    label: "Central",
    hint: "Downtown, Hillcrest, Mid-City, southeastern San Diego",
  },
  {
    id: "north-central",
    label: "North central",
    hint: "Mission Valley, Kearny Mesa, Clairemont, La Jolla",
  },
  { id: "north-coastal", label: "North coastal", hint: "Oceanside, Carlsbad, Vista, Encinitas" },
  { id: "north-inland", label: "North inland", hint: "Escondido, San Marcos, Valley Center" },
  { id: "east", label: "East", hint: "El Cajon, La Mesa, Santee, Spring Valley, Lemon Grove" },
  { id: "south", label: "South", hint: "Chula Vista, National City, Imperial Beach, San Ysidro" },
];

export const FAITH_OPTIONS: { id: FaithPreference; label: string }[] = [
  { id: "faith-ok", label: "A faith-based program is fine" },
  { id: "secular-preferred", label: "Prefers a program that is not faith-based" },
  { id: "no-faith-based", label: "Will not go to a faith-based program" },
  { id: "unasked", label: "Not asked" },
];

export const SUBSTANCE_OPTIONS: Choice[] = [
  { id: "alcohol", label: "Alcohol" },
  { id: "opioids", label: "Opioids", hint: "Fentanyl, heroin, or pain pills" },
  { id: "meth", label: "Methamphetamine" },
  { id: "cocaine", label: "Cocaine" },
  { id: "benzos", label: "Benzodiazepines" },
  { id: "cannabis", label: "Cannabis" },
  { id: "other", label: "Another substance" },
  { id: "none", label: "None", exclusive: true },
  { id: "not-asked", label: "Not asked", exclusive: true },
];

export const DURATION_OPTIONS: { id: SubstanceDuration; label: string }[] = [
  { id: "days", label: "Days" },
  { id: "weeks", label: "Weeks" },
  { id: "months", label: "Months" },
  { id: "one-to-five-years", label: "1–5 years" },
  { id: "over-five-years", label: "More than 5 years" },
  { id: "unasked", label: "Not asked" },
];

export const USE_PATTERN_OPTIONS: Choice[] = [
  { id: "most-days", label: "Using most days" },
  { id: "intoxicated-now", label: "Intoxicated right now" },
  { id: "withdrawal", label: "Withdrawal symptoms now" },
  {
    id: "severe-withdrawal",
    label: "Severe withdrawal",
    hint: "Seizure, confusion, or cannot keep fluids down",
  },
  { id: "wants-stop", label: "Wants help to stop" },
  { id: "wants-mat", label: "Wants medication for opioid use" },
  { id: "not-interested", label: "Not interested in treatment", exclusive: true },
  { id: "not-asked", label: "Not asked", exclusive: true },
];

export const MENTAL_HEALTH_OPTIONS: Choice[] = [
  { id: "depression", label: "Depression" },
  { id: "anxiety", label: "Anxiety" },
  { id: "ptsd", label: "PTSD or trauma symptoms" },
  { id: "bipolar", label: "Bipolar disorder" },
  { id: "psychosis-history", label: "Schizophrenia or a past psychosis diagnosis" },
  { id: "distress-unknown", label: "No named diagnosis, and distress is obvious" },
  { id: "none", label: "None reported", exclusive: true },
  { id: "not-asked", label: "Not asked", exclusive: true },
];

export const SEVERE_MENTAL_HEALTH_OPTIONS: Choice[] = [
  { id: "voices", label: "Hearing or seeing things that frighten them today" },
  { id: "suicide-talk", label: "Talking about suicide today" },
  { id: "recent-attempt", label: "A recent suicide attempt" },
  { id: "gravely-disabled", label: "Not eating or not able to care for themselves" },
  { id: "aggression", label: "Aggressive, or a safety risk to other people" },
  { id: "none", label: "None of these", exclusive: true },
];

export const MEDICAL_OPTIONS: Choice[] = [
  { id: "diabetes", label: "Diabetes" },
  { id: "wound", label: "Wound or infection" },
  { id: "seizure", label: "Seizure disorder" },
  { id: "heart-lung", label: "Heart or breathing disease" },
  { id: "liver", label: "Liver disease" },
  { id: "pain", label: "Chronic pain" },
  { id: "mobility", label: "Difficulty walking" },
  { id: "pregnancy", label: "Pregnant" },
  { id: "dialysis", label: "Dialysis" },
  { id: "none", label: "None known", exclusive: true },
  { id: "not-asked", label: "Not asked", exclusive: true },
];

export const COGNITIVE_OPTIONS: Choice[] = [
  { id: "memory", label: "Memory problems" },
  { id: "tbi", label: "Traumatic brain injury" },
  { id: "developmental", label: "Developmental disability" },
  { id: "confused-today", label: "Confused about time or place today" },
  { id: "reading", label: "Difficulty reading" },
  { id: "none", label: "None seen", exclusive: true },
  { id: "not-asked", label: "Not asked", exclusive: true },
];

export const TRANSPORT_OPTIONS: Choice[] = [
  { id: "can-walk", label: "Can walk to nearby help" },
  { id: "has-car", label: "Has a car" },
  { id: "bus-ok", label: "The bus is realistic" },
  { id: "no-fare", label: "No bus fare" },
  { id: "cannot-walk-far", label: "Cannot walk far" },
  { id: "wheelchair", label: "Needs a lift or wheelchair vehicle" },
  { id: "no-ride-today", label: "No way to get there today" },
  { id: "none", label: "No transportation problem", exclusive: true },
  { id: "not-asked", label: "Not asked", exclusive: true },
];

export const SOCIAL_OPTIONS: Choice[] = [
  { id: "alone", label: "Alone most of the time" },
  { id: "street-network", label: "Street or encampment network" },
  { id: "partner", label: "Partner with them" },
  { id: "children-in-care", label: "Children in their care" },
  { id: "children-elsewhere", label: "Children they are not with" },
  { id: "housed-friend", label: "A housed friend" },
  { id: "no-callback", label: "No one to list as a callback person" },
  { id: "not-asked", label: "Not asked", exclusive: true },
];

export const INCOME_OPTIONS: Choice[] = [
  { id: "none", label: "No income" },
  { id: "cash-aid", label: "General Relief or other cash aid" },
  { id: "ssi", label: "SSI or SSDI" },
  { id: "job", label: "A job or day labor" },
  { id: "informal", label: "Recycling, panhandling, or other informal income" },
  { id: "family-money", label: "Family gives money" },
  { id: "va-benefits", label: "Veterans benefits" },
  { id: "not-asked", label: "Not asked", exclusive: true },
];

export const DOCUMENT_OPTIONS: Choice[] = [
  { id: "photo-id", label: "Photo ID" },
  { id: "birth-certificate", label: "Birth certificate" },
  { id: "ss-card", label: "Social Security card" },
  { id: "medi-cal", label: "Medi-Cal or other insurance card" },
  { id: "proof-income", label: "Proof of income" },
  { id: "phone", label: "A working phone" },
  { id: "none", label: "Nothing important is missing", exclusive: true },
  { id: "not-asked", label: "Not asked", exclusive: true },
];

export const FOOD_OPTIONS: { id: FoodSituation; label: string }[] = [
  { id: "ate-today", label: "Ate today" },
  { id: "skips-meals", label: "Skips meals often" },
  { id: "none-today", label: "No food today" },
  { id: "unasked", label: "Not asked" },
];

export const HOUSING_OPTIONS: { id: HousingType; label: string }[] = [
  { id: "unsheltered", label: "Unsheltered" },
  { id: "vehicle", label: "Living in a vehicle" },
  { id: "shelter", label: "Emergency shelter" },
  { id: "doubled-up", label: "Doubled up or on a couch" },
  { id: "motel", label: "Motel, paid day to day" },
  { id: "losing-housing", label: "Housed, and about to lose it" },
  { id: "housed-stable", label: "Housed and stable" },
  { id: "facility", label: "Hospital, jail, or another facility tonight" },
  { id: "unasked", label: "Not asked" },
];

export const HOUSING_NOTE_OPTIONS: Choice[] = [
  { id: "no-place-tonight", label: "No safe place tonight" },
  { id: "eviction", label: "Eviction in process" },
  { id: "shelter-ban", label: "Banned from a shelter" },
  { id: "waitlist", label: "Already on a housing waitlist" },
  { id: "ces-enrolled", label: "Already in coordinated entry or HMIS" },
  { id: "not-asked", label: "Not asked", exclusive: true },
];

export const FAMILY_OPTIONS: Choice[] = [
  { id: "supportive", label: "Supportive family they can call" },
  { id: "estranged", label: "Family is estranged" },
  { id: "violence", label: "History of violence in the family" },
  { id: "foster", label: "Grew up in foster care or out-of-home care" },
  { id: "no-family", label: "No family they can name" },
  { id: "not-asked", label: "Not asked", exclusive: true },
];

export const MEDICATION_OPTIONS: Choice[] = [
  { id: "psych-now", label: "Psychiatric medication now" },
  { id: "psych-stopped", label: "Psychiatric medication stopped" },
  { id: "buprenorphine", label: "Buprenorphine (Suboxone)" },
  { id: "methadone", label: "Methadone" },
  { id: "naltrexone", label: "Naltrexone" },
  { id: "daily-medical", label: "Insulin or another daily medical medicine" },
  { id: "none", label: "None", exclusive: true },
  { id: "not-asked", label: "Not asked", exclusive: true },
];

export const PRIOR_SERVICE_OPTIONS: Choice[] = [
  { id: "211", label: "2-1-1" },
  { id: "acl", label: "Access & Crisis Line or 988" },
  { id: "csu", label: "A crisis stabilization unit" },
  { id: "sobering-rbc", label: "Sobering center" },
  { id: "mcalister-detox", label: "Detox" },
  { id: "mcalister-kiva", label: "A women's residential program" },
  { id: "mcalister-outpatient", label: "Outpatient substance use treatment" },
  { id: "neil-good-day-center", label: "A day center" },
  { id: "city-shelter", label: "A city shelter" },
  { id: "path", label: "PATH or another housing navigator" },
  { id: "hhsa-benefits", label: "Medi-Cal or CalFresh" },
  { id: "fhcsd", label: "A community clinic" },
  { id: "sdfd-rap", label: "SDFD Resource Access Program" },
  { id: "none", label: "None of these", exclusive: true },
  { id: "not-asked", label: "Not asked", exclusive: true },
];

export const URGENCY_OPTIONS: Choice[] = [
  {
    id: "medical-emergency",
    label: "Medical emergency",
    hint: "Chest pain, trouble breathing, unconscious, severe bleeding",
  },
  { id: "overdose", label: "Overdose or cannot be woken" },
  { id: "severe-withdrawal", label: "Severe withdrawal right now" },
  { id: "suicide", label: "Suicide risk right now" },
  { id: "psychosis", label: "Psychiatric crisis right now" },
  { id: "cant-care", label: "Cannot care for themselves right now" },
  { id: "violence", label: "Violence or a weapon" },
  { id: "intoxicated", label: "Intoxicated in public" },
  { id: "no-shelter-tonight", label: "No safe place tonight" },
  { id: "no-food", label: "No food today" },
  { id: "frequent-911", label: "Known to use 911 often" },
  { id: "none", label: "None of these right now", exclusive: true },
];

export function labelFor(options: { id: string; label: string }[], id: string | null): string {
  if (!id) return "Not answered";
  return options.find((option) => option.id === id)?.label ?? id;
}

export function labelsFor(options: Choice[], ids: string[]): string[] {
  return ids.map((id) => options.find((option) => option.id === id)?.label ?? id);
}
