/** De-identified field profile. No name, birthday, address, or record number. */

export type AgeBand = "under-18" | "18-24" | "25-39" | "40-54" | "55-64" | "65-plus";

export type GenderId =
  | "woman"
  | "man"
  | "trans-woman"
  | "trans-man"
  | "nonbinary"
  | "another"
  | "unasked";

export type CountyRegion =
  | "central"
  | "north-central"
  | "north-coastal"
  | "north-inland"
  | "east"
  | "south";

export type FaithPreference = "faith-ok" | "secular-preferred" | "no-faith-based" | "unasked";

export type FoodSituation = "ate-today" | "skips-meals" | "none-today" | "unasked";

export type HousingType =
  | "unsheltered"
  | "vehicle"
  | "shelter"
  | "doubled-up"
  | "motel"
  | "losing-housing"
  | "housed-stable"
  | "facility"
  | "unasked";

export type SubstanceDuration =
  | "days"
  | "weeks"
  | "months"
  | "one-to-five-years"
  | "over-five-years"
  | "unasked";

export interface PersonProfile {
  ageBand: AgeBand | null;
  gender: GenderId | null;
  veteran: "yes" | "no" | "unasked" | null;
  region: CountyRegion | null;
  faith: FaithPreference | null;
  substances: string[];
  substanceDuration: SubstanceDuration | null;
  usePattern: string[];
  mentalHealth: string[];
  severeMentalHealth: string[];
  medical: string[];
  cognitive: string[];
  transportation: string[];
  social: string[];
  income: string[];
  documentsMissing: string[];
  food: FoodSituation | null;
  housingType: HousingType | null;
  housingNotes: string[];
  familyOrigin: string[];
  medications: string[];
  priorServices: string[];
  urgency: string[];
}

export type ServiceTag =
  | "emergency-medical"
  | "crisis-phone"
  | "mobile-crisis"
  | "crisis-walk-in"
  | "sobering"
  | "detox"
  | "residential-sud"
  | "outpatient-sud"
  | "shelter"
  | "day-center"
  | "housing-navigation"
  | "food-now"
  | "benefits"
  | "primary-care"
  | "documents"
  | "transportation"
  | "older-adults"
  | "veterans"
  | "frequent-utilizer";

export type NeedId =
  | "medical-emergency"
  | "crisis"
  | "violence"
  | "sobering"
  | "detox"
  | "treatment"
  | "shelter"
  | "day"
  | "housing"
  | "food-now"
  | "benefits"
  | "documents"
  | "primary-care"
  | "transport"
  | "older"
  | "veteran"
  | "frequent-911"
  | "family";

export type PlanPhase = "now" | "today" | "this-week" | "stabilize";

export type ResourceGroup =
  | "Crisis"
  | "Substance use"
  | "Housing and daytime"
  | "Food, benefits, and papers"
  | "Health"
  | "Crew programs";

export interface ResourceLocation {
  id: string;
  name: string;
  region: CountyRegion | "countywide";
  address?: string;
  phone: string;
  hours: string;
  serves?: "under-18" | "18-plus" | "women" | "any";
  note?: string;
}

export interface CountyResource {
  id: string;
  name: string;
  group: ResourceGroup;
  summary: string;
  services: ServiceTag[];
  /** Person needs that make this resource worth a call. Any overlap is enough. */
  matches: NeedId[];
  /** If set, the person must also have every one of these needs. */
  matchAll?: NeedId[];
  offers: string[];
  hours: string;
  bestTimeToCall: string;
  phones: { label: string; number: string }[];
  pointOfContact: string;
  sayWhenYouCall: string;
  address?: string;
  links: { label: string; href: string }[];
  sobriety: "not-required" | "expected-during-stay" | "for-public-intoxication" | "na";
  faith: "secular" | "faith-affiliated" | "faith-required";
  ages: "any" | "under-18" | "18-plus" | "older-adults";
  genders: "any" | "women" | "men";
  regions: Array<CountyRegion | "countywide">;
  requirements: string[];
  bring: string[];
  watchouts: string[];
  locations?: ResourceLocation[];
  fallbackLocationId?: string;
  veteransOnly?: boolean;
  crewOnly?: boolean;
  /** Shown in the directory always. Omitted from the call plan when the same door is already covered. */
  planRole: "primary" | "directory";
  sourceUrl: string;
  sourceNote: string;
}

export interface PlanStep {
  resource: CountyResource;
  location?: ResourceLocation;
  alternates: ResourceLocation[];
  phase: PlanPhase;
  why: string[];
  cautions: string[];
  score: number;
}

export interface PlanNeed {
  id: NeedId;
  label: string;
  reason: string;
  severity: 1 | 2 | 3;
}

export interface ResourcePlan {
  steps: PlanStep[];
  needs: PlanNeed[];
  alreadyConnected: PlanStep[];
  ruledOut: { name: string; reason: string }[];
  safety: string | null;
  notes: string[];
  gaps: string[];
}
