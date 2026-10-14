import { TriangleAlert } from "lucide-react";
import { WayfinderCard } from "@/components/county-resource-plan/WayfinderCard";
import { RESOURCE_DIRECTORY_REVIEWED } from "@/lib/county-resource-plan/resources";
import type {
  CountyResource,
  PlanPhase,
  PlanStep,
  ResourcePlan,
} from "@/lib/county-resource-plan/types";

const BANDS: {
  phase: string;
  title: string;
  why: string;
  phases: PlanPhase[];
}[] = [
  {
    phase: "Step 1 · Today",
    title: "Stabilize and stay safe",
    why: "Do these before anything else. A bed and a safe night come before paperwork.",
    phases: ["now", "today"],
  },
  {
    phase: "Step 2 · This week",
    title: "Connect care, benefits, and papers",
    why: "Treatment intake, a clinic, CalFresh, Medi-Cal, and an ID unlock the next step.",
    phases: ["this-week"],
  },
  {
    phase: "Step 3 · Ongoing",
    title: "Housing navigation and follow-up",
    why: "After tonight is safe. A housing plan and the crew follow-up.",
    phases: ["stabilize"],
  },
];

const PLACE: Record<string, string> = {
  central: "Central",
  "north-central": "North central",
  "north-coastal": "North coastal",
  "north-inland": "North inland",
  east: "East County",
  south: "South County",
  countywide: "Countywide",
};

function badgesFor(resource: CountyResource): string[] {
  const badges: string[] = [];
  if (resource.sobriety === "expected-during-stay") badges.push("Sobriety req.");
  if (resource.faith === "faith-required") badges.push("Faith-based");
  else if (resource.faith === "faith-affiliated") badges.push("Faith-affiliated");
  if (resource.veteransOnly) badges.push("Veterans");
  return badges;
}

function phonesFor(step: PlanStep): { label: string; number: string }[] {
  const phones = [...step.resource.phones];
  if (step.location && !phones.some((phone) => phone.number === step.location?.phone)) {
    return [{ label: step.location.name, number: step.location.phone }, ...phones];
  }
  return phones;
}

function placeFor(step: PlanStep): string | undefined {
  if (step.location?.address) return `${step.location.name}. ${step.location.address}`;
  if (step.resource.address) return step.resource.address;
  const regions = step.resource.regions.map((region) => PLACE[region] ?? region);
  return regions.length > 0 ? regions.join(" · ") : undefined;
}

export function PlanView({ plan }: { plan: ResourcePlan }) {
  const bands = BANDS.map((band) => ({
    ...band,
    steps: plan.steps.filter((step) => band.phases.includes(step.phase)),
  })).filter((band) => band.steps.length > 0);

  return (
    <div>
      <div className="hidden print:block">
        <p
          className="text-xs font-semibold uppercase tracking-[0.3em]"
          style={{ color: "var(--cp-teal)" }}
        >
          De-identified plan · checked {RESOURCE_DIRECTORY_REVIEWED}
        </p>
        <h1 className="mt-3 text-5xl">
          Plan of <span className="cp-gradient-text">action</span>
        </h1>
      </div>

      {plan.safety ? (
        <div
          className="mt-8 flex items-start gap-3 rounded-2xl border p-5"
          style={{
            borderColor: "color-mix(in oklab, var(--cp-crisis) 50%, transparent)",
            background: "color-mix(in oklab, var(--cp-crisis) 12%, transparent)",
          }}
        >
          <TriangleAlert
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ color: "var(--cp-crisis)" }}
          />
          <p className="font-semibold">{plan.safety}</p>
        </div>
      ) : null}

      {plan.needs.length === 0 ? (
        <div className="cp-glass mt-12 rounded-2xl p-10 text-center">
          <p style={{ color: "var(--cp-muted-fg)" }}>No needs captured yet.</p>
        </div>
      ) : (
        <>
          <section className="cp-glass mt-10 rounded-2xl p-6">
            <h2
              className="font-sans text-sm font-semibold uppercase tracking-[0.16em]"
              style={{ color: "var(--cp-muted-fg)", fontFamily: "Manrope, system-ui, sans-serif" }}
            >
              Identified needs, by severity
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {plan.needs.map((need) => (
                <span
                  key={need.id}
                  className="cp-need"
                  data-level={need.severity}
                  title={need.reason}
                >
                  {need.label}
                </span>
              ))}
            </div>
          </section>

          <ol
            className="relative mt-14 space-y-16 border-l pl-8 md:pl-12"
            style={{ borderColor: "var(--cp-border)" }}
          >
            {bands.map((band, index) => (
              <li key={band.phase} className="relative">
                <span
                  className="cp-phase-num absolute -left-[45px] top-1 md:-left-[61px]"
                  data-first={index === 0}
                >
                  {index + 1}
                </span>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "var(--cp-teal)" }}
                >
                  {band.phase}
                </p>
                <h2 className="mt-1 text-3xl">{band.title}</h2>
                <p className="mt-1" style={{ color: "var(--cp-muted-fg)" }}>
                  {band.why}
                </p>
                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                  {band.steps.map((step, contact) => (
                    <div key={step.resource.id} className="relative">
                      <span
                        className="absolute -top-2.5 left-4 z-10 rounded-full px-2 text-[10px] font-semibold uppercase tracking-wider"
                        style={{ background: "var(--cp-bg)", color: "var(--cp-primary)" }}
                      >
                        Contact #{contact + 1}
                      </span>
                      <WayfinderCard
                        eyebrow={step.resource.group}
                        title={step.resource.name}
                        badges={badgesFor(step.resource)}
                        services={step.resource.offers.slice(0, 4)}
                        phones={phonesFor(step)}
                        hours={step.location?.hours ?? step.resource.hours}
                        contact={step.resource.pointOfContact}
                        place={placeFor(step)}
                        bestTime={step.resource.bestTimeToCall}
                        note={step.resource.requirements[0]}
                        reasons={step.why}
                        cautions={step.cautions}
                        links={step.resource.links}
                        crewOnly={step.resource.crewOnly}
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>

          {plan.alreadyConnected.length > 0 ? (
            <section className="cp-glass mt-12 rounded-2xl p-6">
              <h2 className="text-2xl">Already connected</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--cp-muted-fg)" }}>
                Call these only if that link fell through.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {plan.alreadyConnected.map((step) => (
                  <li key={step.resource.id}>
                    <span className="font-semibold">{step.resource.name}</span>
                    {step.resource.phones[0] ? ` · ${step.resource.phones[0].number}` : ""}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {plan.ruledOut.length > 0 ? (
            <details className="cp-glass no-print mt-6 rounded-2xl p-6">
              <summary className="cursor-pointer text-lg" style={{ color: "var(--cp-muted-fg)" }}>
                {plan.ruledOut.length} programs filtered out
              </summary>
              <ul className="mt-4 space-y-2 text-sm" style={{ color: "var(--cp-muted-fg)" }}>
                {plan.ruledOut.map((item) => (
                  <li key={item.name}>
                    <span className="font-semibold" style={{ color: "var(--cp-fg)" }}>
                      {item.name}
                    </span>{" "}
                    — {item.reason}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </>
      )}

      <p className="mt-16 flex gap-2 text-xs" style={{ color: "var(--cp-muted-fg)" }}>
        <TriangleAlert className="h-4 w-4 shrink-0" />
        Hours, phone numbers, and eligibility change often. Numbers were checked{" "}
        {RESOURCE_DIRECTORY_REVIEWED}. Confirm a bed before transport. In an emergency call 911. No
        name is stored.
      </p>
    </div>
  );
}
