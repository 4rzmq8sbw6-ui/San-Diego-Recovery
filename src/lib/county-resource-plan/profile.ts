import type { PersonProfile } from "@/lib/county-resource-plan/types";

export function emptyProfile(): PersonProfile {
  return {
    ageBand: null,
    gender: null,
    veteran: null,
    region: null,
    faith: null,
    substances: [],
    substanceDuration: null,
    usePattern: [],
    mentalHealth: [],
    severeMentalHealth: [],
    medical: [],
    cognitive: [],
    transportation: [],
    social: [],
    income: [],
    documentsMissing: [],
    food: null,
    housingType: null,
    housingNotes: [],
    familyOrigin: [],
    medications: [],
    priorServices: [],
    urgency: [],
  };
}

/** A clearly fake profile so a crew can see how the plan sorts. Not a real person. */
export function practiceProfile(): PersonProfile {
  return {
    ageBand: "40-54",
    gender: "man",
    veteran: "no",
    region: "central",
    faith: "faith-ok",
    substances: ["alcohol", "opioids"],
    substanceDuration: "over-five-years",
    usePattern: ["most-days", "intoxicated-now", "wants-stop", "wants-mat"],
    mentalHealth: ["depression", "ptsd"],
    severeMentalHealth: ["none"],
    medical: ["wound"],
    cognitive: ["none"],
    transportation: ["no-fare", "no-ride-today"],
    social: ["alone"],
    income: ["none"],
    documentsMissing: ["photo-id", "medi-cal", "phone"],
    food: "none-today",
    housingType: "unsheltered",
    housingNotes: ["no-place-tonight"],
    familyOrigin: ["estranged"],
    medications: ["none"],
    priorServices: ["none"],
    urgency: ["intoxicated", "no-shelter-tonight", "no-food", "frequent-911"],
  };
}
