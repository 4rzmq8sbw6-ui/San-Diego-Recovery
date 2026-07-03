/**
 * Shared domain types for the recovery navigator.
 *
 * Two halves:
 *  1. The RESOURCE database (organizations, services, eligibility gates).
 *  2. The de-identified INTAKE profile that gets matched against it.
 *
 * `NeedTag` is the connective tissue: resources declare which needs they
 * address, and the intake form derives which needs a person has (with a
 * severity), so the matcher can align the two.
 */

export type NeedTag =
  | "immediate-crisis"
  | "suicidality"
  | "active-intoxication"
  | "withdrawal-management"
  | "substance-treatment"
  | "opioid-mat"
  | "mental-health-treatment"
  | "severe-mental-illness"
  | "shelter"
  | "housing-stability"
  | "food"
  | "identification"
  | "day-services";

export type ServiceCategory =
  | "crisis-line"
  | "sobering"
  | "detox"
  | "residential-sud"
  | "outpatient-sud"
  | "mat"
  | "crisis-stabilization"
  | "shelter"
  | "housing"
  | "food"
  | "vital-documents"
  | "day-services"
  | "navigation";

/** Care sequencing phase — the order we connect people to services. */
export type Phase = "stabilize" | "connect" | "sustain";

export type Gender = "any" | "men" | "women" | "families";

export type Eligibility = {
  minAge?: number;
  maxAge?: number;
  /** Person must already be sober to enter (excludes people actively using). */
  sobrietyRequired?: boolean;
  /** Faith-based program (informational — surfaced as a note, never a hard block). */
  faithBased?: boolean;
  /** Low-barrier: welcomes people who are actively using / intoxicated. */
  acceptsActiveUse?: boolean;
  /** Can safely manage medically complex (alcohol/benzo) withdrawal. */
  medicalDetoxCapable?: boolean;
  /** Equipped for severe / persistent mental illness. */
  acceptsSevereMentalIllness?: boolean;
  /** Entry requires a referral (e.g. law enforcement, Coordinated Entry). */
  referralRequired?: boolean;
  /** Photo ID required to receive services. */
  idRequired?: boolean;
  genders?: Gender[];
  petsAllowed?: boolean;
  cost?: "free" | "low-cost" | "medi-cal" | "donation";
};

export type Resource = {
  id: string;
  name: string;
  program?: string;
  categories: ServiceCategory[];
  /** Needs this resource can help meet (drives matching). */
  addresses: NeedTag[];
  services: string[];
  phone: string;
  phoneLabel?: string;
  altPhone?: string;
  altPhoneLabel?: string;
  address?: string;
  region?: string;
  hours: string;
  bestTimeToCall?: string;
  walkIn?: boolean;
  pointOfContact?: string;
  intakeUrl?: string;
  website?: string;
  eligibility: Eligibility;
  /** Which sequencing phase this resource usually belongs to. */
  phase: Phase;
  notes?: string;
  /** Set true for anything that should be verified before publishing. */
  needsVerification?: boolean;
};
