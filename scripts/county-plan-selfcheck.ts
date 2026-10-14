import { buildPlan } from "../src/lib/county-resource-plan/match";
import { emptyProfile, practiceProfile } from "../src/lib/county-resource-plan/profile";
import { COUNTY_RESOURCES } from "../src/lib/county-resource-plan/resources";

const assert = (cond: unknown, msg: string) => {
  if (!cond) {
    console.error("FAIL", msg);
    process.exitCode = 1;
  }
};

const practice = buildPlan(practiceProfile());
console.log("PRACTICE");
for (const step of practice.steps) {
  console.log(step.phase, step.score, step.resource.id, step.location?.id ?? "");
}
console.log(
  "ruled",
  practice.ruledOut.map((item) => item.name),
);

const names = new Set(practice.steps.map((step) => step.resource.id));
assert(practice.steps[0]?.resource.id === "sobering-rbc", "first should be sobering");
assert(names.has("211"), "211");
assert(names.has("city-shelter"), "shelter");
assert(names.has("mcalister-detox"), "detox");
assert(names.has("hhsa-benefits"), "benefits");
assert(names.has("fhcsd"), "clinic");
assert(names.has("sdfd-rap"), "rap");
assert(!names.has("mcalister-kiva"), "kiva not for a man");
assert(
  practice.ruledOut.some((item) => item.name.includes("Kiva")),
  "kiva ruled out",
);
assert(!names.has("alpha-project"), "alpha stays in directory");
assert(!names.has("emergency-911"), "no 911 without emergency");
assert(
  practice.steps
    .filter((step) => step.phase === "now")
    .every((step) => step.resource.id !== "mcalister-detox"),
  "detox not in now",
);

const crisis = emptyProfile();
crisis.ageBand = "under-18";
crisis.gender = "woman";
crisis.region = "central";
crisis.severeMentalHealth = ["suicide-talk"];
crisis.urgency = ["suicide"];
crisis.housingType = "housed-stable";
const youth = buildPlan(crisis);
console.log("\nYOUTH");
for (const step of youth.steps)
  console.log(step.phase, step.resource.id, step.location?.name ?? "");
assert(youth.steps[0]?.resource.id === "acl", "youth starts at ACL");
assert(
  youth.steps.some((step) => step.resource.id === "csu" && step.location?.serves === "under-18"),
  "youth csu",
);
assert(!youth.steps.some((step) => step.resource.id === "city-shelter"), "no adult shelter");
assert(youth.safety === null, "suicide is not the medical banner");

const emergency = emptyProfile();
emergency.ageBand = "40-54";
emergency.region = "east";
emergency.urgency = ["severe-withdrawal", "overdose"];
emergency.usePattern = ["severe-withdrawal", "wants-stop"];
emergency.substances = ["alcohol"];
const er = buildPlan(emergency);
console.log("\nEMERGENCY");
for (const step of er.steps) console.log(step.phase, step.resource.id, step.location?.id ?? "");
assert(er.steps[0]?.resource.id === "emergency-911", "911 first");
assert(er.safety, "safety banner");
const detox = er.steps.find((step) => step.resource.id === "mcalister-detox");
assert(detox?.phase !== "now", "nonmedical detox not first phase");
assert(
  detox?.cautions.some((caution) => caution.includes("emergency department")),
  "detox caution",
);
assert(
  er.steps.some((step) => step.resource.id === "csu" && step.location?.region === "east"),
  "east csu",
);

const woman = practiceProfile();
woman.gender = "woman";
woman.medical = ["pregnancy", "wound"];
woman.social = ["children-in-care", "alone"];
const mom = buildPlan(woman);
console.log("\nMOM");
for (const step of mom.steps) console.log(step.phase, step.score, step.resource.id);
assert(
  mom.steps.some((step) => step.resource.id === "mcalister-kiva"),
  "kiva for woman",
);
assert(!mom.ruledOut.some((item) => item.name.includes("Kiva")), "kiva not ruled out");

const north = emptyProfile();
north.region = "north-inland";
north.housingType = "unsheltered";
north.housingNotes = ["no-place-tonight"];
north.ageBand = "55-64";
north.urgency = ["frequent-911"];
const northPlan = buildPlan(north);
console.log("\nNORTH");
for (const step of northPlan.steps) console.log(step.phase, step.resource.id);
assert(
  northPlan.steps.some((step) => step.resource.id === "interfaith"),
  "interfaith",
);
assert(!northPlan.steps.some((step) => step.resource.id === "city-shelter"), "not city shelter");
assert(!northPlan.steps.some((step) => step.resource.id === "sdfd-rap"), "rap not north county");

const faith = practiceProfile();
faith.faith = "no-faith-based";
const faithPlan = buildPlan(faith);
const day = faithPlan.steps.find((step) => step.resource.id === "neil-good-day-center");
assert(
  day?.cautions.some((caution) => caution.includes("faith")),
  "faith caution",
);

const connected = practiceProfile();
connected.priorServices = ["211", "mcalister-detox"];
const again = buildPlan(connected);
assert(!again.steps.some((step) => step.resource.id === "211"), "211 moved");
assert(
  again.alreadyConnected.some((step) => step.resource.id === "211"),
  "211 already",
);
assert(
  again.alreadyConnected.some((step) => step.resource.id === "mcalister-detox"),
  "detox already",
);

const blank = buildPlan(emptyProfile());
assert(blank.steps.length === 1 && blank.steps[0]?.resource.id === "211", "blank starts at 211");

console.log("\nresources", COUNTY_RESOURCES.length);
console.log(process.exitCode ? "FAILED" : "OK");
