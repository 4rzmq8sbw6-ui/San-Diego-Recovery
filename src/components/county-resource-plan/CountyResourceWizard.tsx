import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  Compass,
  GitBranch,
  ListOrdered,
  Pencil,
  Printer,
  Sparkles,
} from "lucide-react";
import { ChoiceGrid } from "@/components/county-resource-plan/ChoiceGrid";
import { PlanView } from "@/components/county-resource-plan/PlanView";
import { ResourceDirectory } from "@/components/county-resource-plan/ResourceDirectory";
import { planToText } from "@/lib/county-resource-plan/format";
import { buildPlan } from "@/lib/county-resource-plan/match";
import {
  AGE_OPTIONS,
  COGNITIVE_OPTIONS,
  DOCUMENT_OPTIONS,
  DURATION_OPTIONS,
  FAITH_OPTIONS,
  FAMILY_OPTIONS,
  FOOD_OPTIONS,
  GENDER_OPTIONS,
  HOUSING_NOTE_OPTIONS,
  HOUSING_OPTIONS,
  INCOME_OPTIONS,
  MEDICAL_OPTIONS,
  MEDICATION_OPTIONS,
  MENTAL_HEALTH_OPTIONS,
  PRIOR_SERVICE_OPTIONS,
  REGION_OPTIONS,
  SEVERE_MENTAL_HEALTH_OPTIONS,
  SOCIAL_OPTIONS,
  SUBSTANCE_OPTIONS,
  TRANSPORT_OPTIONS,
  URGENCY_OPTIONS,
  USE_PATTERN_OPTIONS,
  VETERAN_OPTIONS,
  type Choice,
} from "@/lib/county-resource-plan/options";
import { emptyProfile, practiceProfile } from "@/lib/county-resource-plan/profile";
import { COUNTY_RESOURCES } from "@/lib/county-resource-plan/resources";
import type { PersonProfile } from "@/lib/county-resource-plan/types";
import "@/styles/county-plan.css";

type View = "home" | "intake" | "plan" | "directory";

const STEPS = [
  { id: "who", kicker: "01", title: "Who are we planning for?" },
  { id: "safety", kicker: "02", title: "Immediate safety" },
  { id: "sud", kicker: "03", title: "Substance use" },
  { id: "mind", kicker: "04", title: "Mental and cognitive health" },
  { id: "medical", kicker: "05", title: "Medical" },
  { id: "life", kicker: "06", title: "Daily life and stability" },
  { id: "income", kicker: "07", title: "Income and support system" },
  { id: "history", kicker: "08", title: "History and preferences" },
] as const;

const PROFILE_STORAGE = "wayfinder-profile";
const GATE_STORAGE = "wayfinder-use-gate";

type UseGate = "yes" | "recovery" | "no" | "unasked";

const USE_GATE_OPTIONS: Choice[] = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
  { id: "recovery", label: "In early recovery" },
  { id: "unasked", label: "Not asked" },
];

function usingSubstances(profile: PersonProfile) {
  return profile.substances.some((id) => id !== "none" && id !== "not-asked");
}

function gateFromProfile(profile: PersonProfile): UseGate | null {
  if (profile.substances.includes("none")) return "no";
  if (profile.substances.includes("not-asked")) return "unasked";
  if (usingSubstances(profile)) return "yes";
  return null;
}

function isUseGate(value: string | null): value is UseGate {
  return value === "yes" || value === "recovery" || value === "no" || value === "unasked";
}

function housingNotesFor(profile: PersonProfile): Choice[] {
  const type = profile.housingType;
  if (!type || type === "unasked") return HOUSING_NOTE_OPTIONS;
  if (type === "housed-stable") {
    return HOUSING_NOTE_OPTIONS.filter((option) => option.id !== "no-place-tonight");
  }
  if (type === "unsheltered" || type === "vehicle" || type === "shelter") {
    return HOUSING_NOTE_OPTIONS.filter((option) => option.id !== "eviction");
  }
  return HOUSING_NOTE_OPTIONS;
}

function medicationOptionsFor(profile: PersonProfile): Choice[] {
  const opioids = profile.substances.includes("opioids");
  const alcohol = profile.substances.includes("alcohol");
  return MEDICATION_OPTIONS.filter((option) => {
    if (option.id === "buprenorphine" || option.id === "methadone") return opioids;
    if (option.id === "naltrexone") return opioids || alcohol;
    return true;
  });
}

const HOME_STEPS = [
  {
    icon: ClipboardCheck,
    title: "Check the boxes",
    detail:
      "A de-identified template — no names, no PHI. Age band, substances, diagnoses, housing, documents and more.",
  },
  {
    icon: GitBranch,
    title: "The tree branches",
    detail:
      "Questions adapt to answers. Eligibility rules filter out programs the person can't enter.",
  },
  {
    icon: ListOrdered,
    title: "Get the plan",
    detail: "An ordered plan with phone numbers, contacts, best times to call and intake links.",
  },
];

function toggleIn(list: string[], id: string, choices: Choice[]): string[] {
  if (list.includes(id)) return list.filter((item) => item !== id);
  const choice = choices.find((item) => item.id === id);
  if (choice?.exclusive) return [id];
  const exclusive = new Set(choices.filter((item) => item.exclusive).map((item) => item.id));
  return [...list.filter((item) => !exclusive.has(item)), id];
}

export function CountyResourceWizard() {
  const [view, setView] = useState<View>("home");
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<PersonProfile>(emptyProfile);
  const [useGate, setUseGate] = useState<UseGate | null>(null);
  const [ready, setReady] = useState(false);
  const plan = useMemo(() => buildPlan(profile), [profile]);
  const current = STEPS[step];

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(PROFILE_STORAGE);
      if (saved) {
        const next = { ...emptyProfile(), ...JSON.parse(saved) } as PersonProfile;
        setProfile(next);
        const storedGate = sessionStorage.getItem(GATE_STORAGE);
        setUseGate(isUseGate(storedGate) ? storedGate : gateFromProfile(next));
      }
    } catch {
      /* a bad saved profile just starts blank */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(PROFILE_STORAGE, JSON.stringify(profile));
  }, [profile, ready]);

  useEffect(() => {
    if (!ready) return;
    if (useGate) sessionStorage.setItem(GATE_STORAGE, useGate);
    else sessionStorage.removeItem(GATE_STORAGE);
  }, [useGate, ready]);

  useEffect(() => {
    const previousBackground = document.body.style.background;
    const previousColor = document.body.style.color;
    document.body.style.background = "oklch(17% 0.025 215)";
    document.body.style.color = "oklch(95% 0.015 85)";
    return () => {
      document.body.style.background = previousBackground;
      document.body.style.color = previousColor;
    };
  }, []);

  function setMulti(key: keyof PersonProfile, choices: Choice[], id: string) {
    setProfile((currentProfile) => {
      const value = currentProfile[key];
      if (!Array.isArray(value)) return currentProfile;
      const next = { ...currentProfile, [key]: toggleIn(value, id, choices) };
      if (key === "substances" && !usingSubstances(next)) {
        next.substanceDuration = null;
        next.usePattern = [];
      }
      return next;
    });
  }

  function setSingle<K extends keyof PersonProfile>(key: K, id: PersonProfile[K]) {
    setProfile((currentProfile) => ({
      ...currentProfile,
      [key]: currentProfile[key] === id ? null : id,
    }));
  }

  function chooseUseGate(id: string) {
    const nextGate = useGate === id ? null : (id as UseGate);
    setUseGate(nextGate);
    setProfile((currentProfile) => {
      if (nextGate === "no") {
        return {
          ...currentProfile,
          substances: ["none"],
          substanceDuration: null,
          usePattern: [],
        };
      }
      if (nextGate === "unasked") {
        return {
          ...currentProfile,
          substances: ["not-asked"],
          substanceDuration: null,
          usePattern: [],
        };
      }
      return {
        ...currentProfile,
        substances: currentProfile.substances.filter(
          (item) => item !== "none" && item !== "not-asked",
        ),
        substanceDuration: nextGate ? currentProfile.substanceDuration : null,
        usePattern: nextGate ? currentProfile.usePattern : [],
      };
    });
  }

  async function copyPlan() {
    try {
      await navigator.clipboard.writeText(planToText(profile, plan));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="county-plan min-h-screen">
      <div className={`cp-map no-print${view === "home" ? "" : " cp-map-dim"}`} aria-hidden>
        <img src="/wayfinder/hero-map.jpg" alt="" width={1600} height={912} />
        <div className="cp-map-scrim" />
      </div>
      <div className="cp-shell">
        <header className="cp-header no-print">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <button
              type="button"
              className="flex items-center gap-2.5"
              onClick={() => setView("home")}
            >
              <span className="cp-logo-mark">
                <Compass className="h-4 w-4" />
              </span>
              <span className="text-lg" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
                Wayfinder <span style={{ color: "var(--cp-muted-fg)" }}>SD</span>
              </span>
            </button>
            <nav className="flex shrink-0 items-center gap-3 sm:gap-6">
              <button
                type="button"
                className="text-sm transition-colors"
                style={{ color: view === "directory" ? "var(--cp-fg)" : "var(--cp-muted-fg)" }}
                onClick={() => setView("directory")}
              >
                Directory
              </button>
              <button
                type="button"
                className="cp-amber px-4 py-2 text-sm"
                onClick={() => {
                  setStep(0);
                  setView("intake");
                }}
              >
                New plan
              </button>
            </nav>
          </div>
        </header>

        {view === "home" ? (
          <>
            <section className="relative overflow-hidden">
              <div className="cp-hero relative mx-auto max-w-6xl px-6 pb-28 pt-28 md:pt-40">
                <p
                  className="text-xs font-semibold uppercase tracking-[0.3em]"
                  style={{ color: "var(--cp-teal)" }}
                >
                  San Diego County · {COUNTY_RESOURCES.length} programs mapped
                </p>
                <h1 className="mt-5 max-w-3xl text-5xl leading-[1.05] md:text-7xl">
                  Every frequent caller <span className="cp-gradient-text">has a path.</span>
                </h1>
                <p className="mt-6 max-w-xl text-lg" style={{ color: "var(--cp-muted-fg)" }}>
                  A decision-tree wizard for people who rely heavily on emergency services. Fill a
                  de-identified profile, get a prioritized plan of action.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <button
                    type="button"
                    className="cp-amber px-7 py-3.5"
                    onClick={() => {
                      setStep(0);
                      setView("intake");
                    }}
                  >
                    Start an intake <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="cp-ghost px-7 py-3.5"
                    onClick={() => setView("directory")}
                  >
                    Browse directory
                  </button>
                </div>
              </div>
            </section>
            <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-24 md:grid-cols-3">
              {HOME_STEPS.map((item, index) => (
                <div key={item.title} className="cp-glass rounded-2xl p-7">
                  <div className="flex items-center justify-between">
                    <item.icon className="h-6 w-6" style={{ color: "var(--cp-primary)" }} />
                    <span
                      className="text-4xl"
                      style={{
                        fontFamily: "Fraunces, Georgia, serif",
                        color: "color-mix(in oklab, var(--cp-muted-fg) 30%, transparent)",
                      }}
                    >
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-2xl">{item.title}</h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: "var(--cp-muted-fg)" }}
                  >
                    {item.detail}
                  </p>
                </div>
              ))}
            </section>
          </>
        ) : null}

        {view === "intake" ? (
          <main className="mx-auto max-w-4xl px-6 py-12">
            <div className="mb-10 flex gap-1.5">
              {STEPS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.title}
                  onClick={() => setStep(index)}
                  className="h-1.5 flex-1 rounded-full"
                  style={{
                    background: index <= step ? "var(--cp-gradient-amber)" : "var(--cp-muted)",
                  }}
                />
              ))}
            </div>
            <div key={current.id} className="cp-step-in">
              <p
                className="text-6xl"
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  color: "color-mix(in oklab, var(--cp-primary) 30%, transparent)",
                }}
              >
                {current.kicker}
              </p>
              <h1 className="mt-2 text-4xl md:text-5xl">{current.title}</h1>
              <p className="mt-2 text-sm" style={{ color: "var(--cp-muted-fg)" }}>
                No names, DOBs or identifiers — checkboxes only.
              </p>
              <div className="mt-10 space-y-10">
                <StepFields
                  stepId={current.id}
                  profile={profile}
                  useGate={useGate}
                  setSingle={setSingle}
                  setMulti={setMulti}
                  chooseUseGate={chooseUseGate}
                />
              </div>
            </div>
            <div
              className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t pt-6"
              style={{ borderColor: "var(--cp-border)" }}
            >
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep((value) => value - 1)}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm disabled:opacity-30"
                style={{ color: "var(--cp-muted-fg)" }}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-full px-5 py-3 text-sm"
                  style={{ color: "var(--cp-muted-fg)" }}
                  onClick={() => {
                    setProfile(practiceProfile());
                    setUseGate("yes");
                    setView("plan");
                  }}
                >
                  Sample
                </button>
                <button
                  type="button"
                  className="rounded-full px-5 py-3 text-sm"
                  style={{ color: "var(--cp-muted-fg)" }}
                  onClick={() => {
                    setProfile(emptyProfile());
                    setUseGate(null);
                    setStep(0);
                  }}
                >
                  Reset
                </button>
                {step === STEPS.length - 1 ? (
                  <button
                    type="button"
                    className="cp-amber px-7 py-3"
                    onClick={() => setView("plan")}
                  >
                    <Sparkles className="h-4 w-4" /> Build plan of action
                  </button>
                ) : (
                  <button
                    type="button"
                    className="cp-amber px-7 py-3"
                    onClick={() => setStep((value) => value + 1)}
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </main>
        ) : null}

        {view === "plan" ? (
          <main className="mx-auto max-w-6xl px-6 py-12">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.3em]"
                  style={{ color: "var(--cp-teal)" }}
                >
                  De-identified plan · {new Date().toLocaleDateString()}
                </p>
                <h1 className="mt-3 text-5xl md:text-6xl">
                  Plan of <span className="cp-gradient-text">action</span>
                </h1>
              </div>
              <div className="no-print flex flex-wrap gap-3">
                <button
                  type="button"
                  className="cp-ghost px-5 py-2.5 text-sm"
                  onClick={() => setView("intake")}
                >
                  <Pencil className="h-4 w-4" /> Edit intake
                </button>
                <button
                  type="button"
                  className="cp-ghost px-5 py-2.5 text-sm"
                  onClick={() => void copyPlan()}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  className="cp-amber px-5 py-2.5 text-sm"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4" /> Print / PDF
                </button>
              </div>
            </div>
            <PlanView plan={plan} />
          </main>
        ) : null}

        {view === "directory" ? (
          <main className="mx-auto max-w-6xl px-6 py-12">
            <h1 className="text-5xl md:text-6xl">
              The <span className="cp-gradient-text">directory</span>
            </h1>
            <p className="mt-3 max-w-xl" style={{ color: "var(--cp-muted-fg)" }}>
              {COUNTY_RESOURCES.length} San Diego County programs with services, hours, contacts and
              entry requirements.
            </p>
            <div className="mt-8">
              <ResourceDirectory />
            </div>
          </main>
        ) : null}
      </div>
    </div>
  );
}

function StepFields({
  stepId,
  profile,
  useGate,
  setSingle,
  setMulti,
  chooseUseGate,
}: {
  stepId: (typeof STEPS)[number]["id"];
  profile: PersonProfile;
  useGate: UseGate | null;
  setSingle: <K extends keyof PersonProfile>(key: K, id: PersonProfile[K]) => void;
  setMulti: (key: keyof PersonProfile, choices: Choice[], id: string) => void;
  chooseUseGate: (id: string) => void;
}) {
  if (stepId === "who") {
    return (
      <>
        <Field title="Age" mode="single">
          <ChoiceGrid
            legend="Age"
            mode="single"
            options={AGE_OPTIONS}
            selected={profile.ageBand ? [profile.ageBand] : []}
            onToggle={(id) => setSingle("ageBand", id as PersonProfile["ageBand"])}
          />
        </Field>
        <Field title="Gender" mode="single">
          <ChoiceGrid
            legend="Gender"
            mode="single"
            options={GENDER_OPTIONS}
            selected={profile.gender ? [profile.gender] : []}
            onToggle={(id) => setSingle("gender", id as PersonProfile["gender"])}
          />
        </Field>
        <Field title="Military veteran?" mode="single">
          <ChoiceGrid
            legend="Veteran"
            mode="single"
            options={VETERAN_OPTIONS}
            selected={profile.veteran ? [profile.veteran] : []}
            onToggle={(id) => setSingle("veteran", id as PersonProfile["veteran"])}
          />
        </Field>
      </>
    );
  }

  if (stepId === "safety") {
    return (
      <>
        <Field title="What is true on this contact" mode="multi">
          <ChoiceGrid
            legend="Urgency"
            options={URGENCY_OPTIONS}
            selected={profile.urgency}
            onToggle={(id) => setMulti("urgency", URGENCY_OPTIONS, id)}
          />
        </Field>
        {profile.urgency.length > 0 ? (
          <Reveal>
            <Field
              title="Where they are now"
              mode="single"
              hint="Picks the closest site. It is not a street address."
            >
              <ChoiceGrid
                legend="Region"
                mode="single"
                options={REGION_OPTIONS}
                selected={profile.region ? [profile.region] : []}
                onToggle={(id) => setSingle("region", id as PersonProfile["region"])}
              />
            </Field>
          </Reveal>
        ) : null}
      </>
    );
  }

  if (stepId === "sud") {
    return (
      <>
        <Field title="Any current substance use?" mode="single">
          <ChoiceGrid
            legend="Current substance use"
            mode="single"
            options={USE_GATE_OPTIONS}
            selected={useGate ? [useGate] : []}
            onToggle={chooseUseGate}
          />
        </Field>
        {useGate === "yes" || useGate === "recovery" ? (
          <Reveal>
            <Field title="Substances used" mode="multi">
              <ChoiceGrid
                legend="Substances"
                options={SUBSTANCE_OPTIONS.filter(
                  (option) => option.id !== "none" && option.id !== "not-asked",
                )}
                selected={profile.substances}
                onToggle={(id) => setMulti("substances", SUBSTANCE_OPTIONS, id)}
              />
            </Field>
            <Field title="Length of use" mode="single">
              <ChoiceGrid
                legend="Duration"
                mode="single"
                options={DURATION_OPTIONS}
                selected={profile.substanceDuration ? [profile.substanceDuration] : []}
                onToggle={(id) =>
                  setSingle("substanceDuration", id as PersonProfile["substanceDuration"])
                }
              />
            </Field>
            <Field title="Pattern right now" mode="multi">
              <ChoiceGrid
                legend="Use pattern"
                options={USE_PATTERN_OPTIONS.filter(
                  (option) => option.id !== "wants-mat" || profile.substances.includes("opioids"),
                )}
                selected={profile.usePattern}
                onToggle={(id) => setMulti("usePattern", USE_PATTERN_OPTIONS, id)}
              />
            </Field>
          </Reveal>
        ) : null}
      </>
    );
  }

  if (stepId === "mind") {
    return (
      <>
        <Field title="Mental health diagnoses" mode="multi">
          <ChoiceGrid
            legend="Mental health"
            options={MENTAL_HEALTH_OPTIONS}
            selected={profile.mentalHealth}
            onToggle={(id) => setMulti("mentalHealth", MENTAL_HEALTH_OPTIONS, id)}
          />
        </Field>
        {profile.mentalHealth.length > 0 ? (
          <Reveal>
            <Field title="Severe symptoms today" mode="multi">
              <ChoiceGrid
                legend="Severe mental health"
                options={SEVERE_MENTAL_HEALTH_OPTIONS}
                selected={profile.severeMentalHealth}
                onToggle={(id) => setMulti("severeMentalHealth", SEVERE_MENTAL_HEALTH_OPTIONS, id)}
              />
            </Field>
            <Field title="Cognitive deficits" mode="multi">
              <ChoiceGrid
                legend="Cognitive"
                options={COGNITIVE_OPTIONS}
                selected={profile.cognitive}
                onToggle={(id) => setMulti("cognitive", COGNITIVE_OPTIONS, id)}
              />
            </Field>
          </Reveal>
        ) : null}
      </>
    );
  }

  if (stepId === "medical") {
    return (
      <>
        <Field title="Medical diagnoses" mode="multi">
          <ChoiceGrid
            legend="Medical"
            options={MEDICAL_OPTIONS}
            selected={profile.medical}
            onToggle={(id) => setMulti("medical", MEDICAL_OPTIONS, id)}
          />
        </Field>
        {profile.medical.length > 0 ? (
          <Reveal>
            <Field title="Previous or current medications" mode="multi">
              <ChoiceGrid
                legend="Medications"
                options={medicationOptionsFor(profile)}
                selected={profile.medications}
                onToggle={(id) => setMulti("medications", MEDICATION_OPTIONS, id)}
              />
            </Field>
          </Reveal>
        ) : null}
      </>
    );
  }

  if (stepId === "life") {
    return (
      <>
        <Field title="Where is the person sleeping tonight?" mode="single">
          <ChoiceGrid
            legend="Housing"
            mode="single"
            options={HOUSING_OPTIONS}
            selected={profile.housingType ? [profile.housingType] : []}
            onToggle={(id) => setSingle("housingType", id as PersonProfile["housingType"])}
          />
        </Field>
        {profile.housingType ? (
          <Reveal>
            <Field title="Housing stability" mode="multi">
              <ChoiceGrid
                legend="Housing stability"
                options={housingNotesFor(profile)}
                selected={profile.housingNotes}
                onToggle={(id) => setMulti("housingNotes", HOUSING_NOTE_OPTIONS, id)}
              />
            </Field>
            <Field title="Food security" mode="single">
              <ChoiceGrid
                legend="Food"
                mode="single"
                options={FOOD_OPTIONS}
                selected={profile.food ? [profile.food] : []}
                onToggle={(id) => setSingle("food", id as PersonProfile["food"])}
              />
            </Field>
            <Field title="Transportation" mode="multi">
              <ChoiceGrid
                legend="Transportation"
                options={TRANSPORT_OPTIONS}
                selected={profile.transportation}
                onToggle={(id) => setMulti("transportation", TRANSPORT_OPTIONS, id)}
              />
            </Field>
            <Field title="Documents that are missing" mode="multi">
              <ChoiceGrid
                legend="Documents"
                options={DOCUMENT_OPTIONS}
                selected={profile.documentsMissing}
                onToggle={(id) => setMulti("documentsMissing", DOCUMENT_OPTIONS, id)}
              />
            </Field>
          </Reveal>
        ) : null}
      </>
    );
  }

  if (stepId === "income") {
    return (
      <>
        <Field title="Income sources" mode="multi">
          <ChoiceGrid
            legend="Income"
            options={INCOME_OPTIONS}
            selected={profile.income}
            onToggle={(id) => setMulti("income", INCOME_OPTIONS, id)}
          />
        </Field>
        {profile.income.length > 0 ? (
          <Reveal>
            <Field title="Social sphere" mode="multi">
              <ChoiceGrid
                legend="Social"
                options={SOCIAL_OPTIONS}
                selected={profile.social}
                onToggle={(id) => setMulti("social", SOCIAL_OPTIONS, id)}
              />
            </Field>
            <Field title="Family of origin" mode="multi">
              <ChoiceGrid
                legend="Family"
                options={FAMILY_OPTIONS}
                selected={profile.familyOrigin}
                onToggle={(id) => setMulti("familyOrigin", FAMILY_OPTIONS, id)}
              />
            </Field>
          </Reveal>
        ) : null}
      </>
    );
  }

  return (
    <>
      <Field title="Services previously connected to" mode="multi">
        <ChoiceGrid
          legend="Prior services"
          options={PRIOR_SERVICE_OPTIONS}
          selected={profile.priorServices}
          onToggle={(id) => setMulti("priorServices", PRIOR_SERVICE_OPTIONS, id)}
        />
      </Field>
      {profile.priorServices.length > 0 ? (
        <Reveal>
          <Field title="Faith-based programs?" mode="single">
            <ChoiceGrid
              legend="Faith"
              mode="single"
              options={FAITH_OPTIONS}
              selected={profile.faith ? [profile.faith] : []}
              onToggle={(id) => setSingle("faith", id as PersonProfile["faith"])}
            />
          </Field>
        </Reveal>
      ) : null}
    </>
  );
}

function Reveal({ children }: { children: ReactNode }) {
  return <div className="cp-step-in space-y-10">{children}</div>;
}

function Field({
  title,
  hint,
  mode,
  children,
}: {
  title: string;
  hint?: string;
  mode: "single" | "multi";
  children: ReactNode;
}) {
  return (
    <div>
      <p className="cp-kicker mb-4">
        {title}
        <span className="cp-kicker-note">
          {mode === "multi" ? "select all that apply" : "choose one"}
        </span>
      </p>
      {hint ? (
        <p className="-mt-2 mb-3 text-sm" style={{ color: "var(--cp-muted-fg)" }}>
          {hint}
        </p>
      ) : null}
      {children}
    </div>
  );
}
