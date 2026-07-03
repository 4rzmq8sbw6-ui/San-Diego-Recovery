import { useMemo, useState } from "react";
import {
  Sparkles,
  ShieldAlert,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  Shield,
  Printer,
  RotateCcw,
  ClipboardList,
  Info,
  X,
} from "lucide-react";
import {
  ALL_FIELDS,
  INTAKE_SECTIONS,
  answeredCount,
  emptyIntake,
  sampleIntake,
  type IntakeState,
} from "@/data/intake";
import { buildPlan, NEED_LABELS, type ResourceMatch } from "@/lib/matcher";
import { FieldRow, useIntakeSetter } from "@/components/fields";
import { NeedsSummary, ResourceCard, SeverityDot } from "@/components/plan";

type Tab = "profile" | "plan";

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = max ? Math.round((score / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-sand">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            background:
              pct >= 70 ? "var(--color-leaf)" : pct >= 40 ? "var(--color-sun)" : "var(--color-sky)",
          }}
        />
      </div>
      <span className="text-xs font-extrabold text-ink-soft">{score}</span>
    </div>
  );
}

function MatchRationale({ match }: { match: ResourceMatch }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 print:hidden">
      <button
        type="button"
        className="flex items-center gap-1 text-sm font-semibold text-teal"
        onClick={() => setOpen((o) => !o)}
      >
        Why this match? {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open ? (
        <ul className="mt-2 space-y-1 text-sm text-ink-soft">
          {match.matchedNeeds.map((tag) => (
            <li key={tag}>Addresses: {NEED_LABELS[tag]}</li>
          ))}
          {match.resource.notes ? <li className="italic">{match.resource.notes}</li> : null}
        </ul>
      ) : null}
    </div>
  );
}

function AppHeader() {
  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur-sm print:border-0 print:bg-transparent">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-4 sm:px-6">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl print:hidden"
          style={{ background: "var(--color-teal-soft)" }}
        >
          <HeartHandshake size={22} color="var(--color-teal)" strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <p className="display text-lg font-extrabold leading-tight text-ink sm:text-xl">
            San Diego Recovery
          </p>
          <p className="text-xs font-semibold text-ink-soft sm:text-sm">
            Care Plan Builder · de-identified · no PHI stored
          </p>
        </div>
      </div>
    </header>
  );
}

function PrototypeBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="border-b border-line px-4 py-2.5 text-sm print:hidden sm:px-6"
      style={{ background: "var(--color-sun-soft)" }}
    >
      <div className="mx-auto flex max-w-4xl items-start gap-2.5 text-ink">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p className="flex-1">
          <span className="font-bold">Prototype.</span> Starter resource data is compiled from
          public county &amp; provider sources and should be verified before real-world use. No
          personal health information (PHI) is collected or stored.
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-full p-1 hover:bg-white/40"
          aria-label="Dismiss notice"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export function CarePlanBuilder() {
  const [state, setState] = useState<IntakeState>(emptyIntake);
  const [tab, setTab] = useState<Tab>("profile");
  const [showBanner, setShowBanner] = useState(true);
  const setField = useIntakeSetter(setState);
  const plan = useMemo(() => buildPlan(state), [state]);
  const maxScore = plan.matches[0]?.score ?? 1;
  const filled = answeredCount(state);
  const progress = Math.round((filled / ALL_FIELDS.length) * 100);

  const phaseOffsets = useMemo(() => {
    let offset = 0;
    return plan.phases.map((p) => {
      const start = offset;
      offset += p.matches.length;
      return start;
    });
  }, [plan.phases]);

  const handlePrint = () => {
    setTab("plan");
    requestAnimationFrame(() => window.print());
  };

  return (
    <div className="min-h-screen pb-24 sm:pb-16">
      {showBanner ? <PrototypeBanner onDismiss={() => setShowBanner(false)} /> : null}
      <AppHeader />

      <div className="mx-auto max-w-4xl px-4 pt-5 sm:px-6 sm:pt-8">
        <div className="mb-5 print:hidden">
          <h1 className="display text-2xl font-extrabold text-ink sm:text-3xl">
            Build a care plan
          </h1>
          <p className="mt-1 text-ink-soft">
            Fill out the de-identified profile, then get a scored, sequenced list of county
            resources — phones, hours, and intake links in the right order.
          </p>
        </div>

        {/* Tab bar */}
        <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-line bg-cream/95 px-4 py-3 backdrop-blur-sm print:hidden sm:static sm:mx-0 sm:rounded-2xl sm:border sm:bg-paper sm:px-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn text-sm"
              style={{
                background: tab === "profile" ? "var(--color-teal)" : "transparent",
                color: tab === "profile" ? "#fff" : "var(--color-ink)",
                border: `2px solid ${tab === "profile" ? "var(--color-teal)" : "var(--color-line)"}`,
                minHeight: 44,
              }}
              onClick={() => setTab("profile")}
            >
              <ClipboardList size={16} /> 1. Profile
              {tab === "profile" ? (
                <span className="ml-1 rounded-full bg-white/25 px-2 py-0.5 text-xs">{progress}%</span>
              ) : null}
            </button>
            <button
              type="button"
              className="btn text-sm"
              style={{
                background: tab === "plan" ? "var(--color-teal)" : "transparent",
                color: tab === "plan" ? "#fff" : "var(--color-ink)",
                border: `2px solid ${tab === "plan" ? "var(--color-teal)" : "var(--color-line)"}`,
                minHeight: 44,
              }}
              onClick={() => setTab("plan")}
            >
              2. Care plan
              {plan.matches.length ? (
                <span className="ml-1 rounded-full bg-white/25 px-2 py-0.5 text-xs">
                  {plan.matches.length}
                </span>
              ) : null}
            </button>

            <div className="ml-auto flex gap-2">
              <button
                type="button"
                className="btn btn-ghost text-sm"
                title="Load sample profile"
                onClick={() => {
                  setState(sampleIntake());
                  setTab("plan");
                }}
              >
                <Sparkles size={14} />
                <span className="hidden sm:inline">Sample</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost text-sm"
                title="Reset profile"
                onClick={() => {
                  setState(emptyIntake());
                  setTab("profile");
                }}
              >
                <RotateCcw size={14} />
                <span className="hidden sm:inline">Reset</span>
              </button>
              {tab === "plan" && plan.matches.length > 0 ? (
                <button type="button" className="btn btn-primary text-sm" onClick={handlePrint}>
                  <Printer size={14} /> Print
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {tab === "profile" ? (
          <div className="space-y-4 print:hidden">
            {/* Live needs preview */}
            {plan.needs.length > 0 ? (
              <div className="card p-4">
                <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ink-soft">
                  Emerging needs (live)
                </p>
                <NeedsSummary needs={plan.needs} />
              </div>
            ) : null}

            {/* Progress */}
            <div className="card p-4">
              <div className="mb-1 flex justify-between text-sm font-semibold">
                <span>Profile completion</span>
                <span className="text-ink-soft">
                  {filled} / {ALL_FIELDS.length}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-sand">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: "var(--color-teal)" }}
                />
              </div>
            </div>

            {INTAKE_SECTIONS.map((sec) => (
              <section key={sec.id} className="card p-5 sm:p-6">
                <h2 className="display mb-1 text-lg font-extrabold">{sec.title}</h2>
                <p className="mb-4 text-sm text-ink-soft">{sec.blurb}</p>
                <div className="space-y-5">
                  {sec.fields.map((f) => (
                    <FieldRow key={f.key} field={f} state={state} setField={setField} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div id="care-plan-output" className="space-y-6">
            <div className="hidden print:block print:mb-6">
              <h1 className="display text-2xl font-extrabold">Care Plan — De-identified</h1>
              <p className="text-sm text-ink-soft">
                Generated {new Date().toLocaleDateString()} · San Diego County · No PHI
              </p>
            </div>

            {plan.headline ? (
              <div
                className="card flex items-start gap-3 p-4"
                style={{
                  borderColor:
                    plan.headline.tone === "safety" ? "var(--color-coral)" : "var(--color-sun)",
                }}
              >
                <ShieldAlert
                  size={22}
                  className="shrink-0 print:hidden"
                  style={{
                    color:
                      plan.headline.tone === "safety" ? "var(--color-coral)" : "var(--color-sun)",
                  }}
                />
                <p className="font-semibold">{plan.headline.text}</p>
              </div>
            ) : null}

            {!plan.needs.length ? (
              <div className="card p-8 text-center">
                <Shield size={32} className="mx-auto text-ink-soft" />
                <p className="display mt-3 text-lg font-extrabold">No needs detected yet</p>
                <p className="mt-1 text-sm text-ink-soft">
                  Go back to the profile and answer a few questions, or load the sample profile.
                </p>
                <button
                  type="button"
                  className="btn btn-primary mt-4"
                  onClick={() => setTab("profile")}
                >
                  Fill out profile
                </button>
              </div>
            ) : (
              <>
                <div className="card p-5">
                  <h2 className="display mb-3 flex items-center gap-2 text-lg font-extrabold">
                    <TrendingUp size={18} /> Derived needs
                  </h2>
                  <NeedsSummary needs={plan.needs} />
                  <ul className="mt-4 space-y-2">
                    {plan.needs.map((n) => (
                      <li key={n.tag} className="flex gap-2 text-sm text-ink-soft">
                        <SeverityDot severity={n.severity} />
                        <span>
                          <span className="font-semibold text-ink">{n.label}</span> — {n.reason}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.phases.length ? (
                  plan.phases.map((phase, phaseIdx) => (
                    <section key={phase.phase} className="break-inside-avoid">
                      <div
                        className="mb-4 rounded-2xl px-4 py-3"
                        style={{
                          background:
                            phase.phase === "stabilize"
                              ? "var(--color-coral-soft)"
                              : phase.phase === "connect"
                                ? "var(--color-sun-soft)"
                                : "var(--color-leaf-soft)",
                        }}
                      >
                        <h3 className="display text-xl font-extrabold text-ink">{phase.title}</h3>
                        <p className="text-sm text-ink-soft">{phase.subtitle}</p>
                      </div>
                      <div className="space-y-5">
                        {phase.matches.map((m, i) => {
                          const step = phaseOffsets[phaseIdx] + i + 1;
                          return (
                            <div key={m.resource.id} className="break-inside-avoid">
                              <div className="mb-1 flex items-center justify-between gap-2 px-1 print:hidden">
                                <span className="text-sm font-bold text-ink-soft">
                                  Step {step} · fit score
                                </span>
                                <ScoreBar score={m.score} max={maxScore} />
                              </div>
                              <p className="mb-1 hidden text-sm font-bold text-ink-soft print:block">
                                Step {step}
                              </p>
                              <ResourceCard match={m} rank={step} />
                              <MatchRationale match={m} />
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ))
                ) : (
                  <div className="card p-6 text-center text-ink-soft">
                    No eligible resources matched. Check excluded items below or add more profile
                    detail.
                  </div>
                )}

                {plan.excluded.length ? (
                  <details className="card p-5 print:hidden">
                    <summary className="display cursor-pointer font-extrabold text-ink-soft">
                      {plan.excluded.length} resources filtered out (eligibility)
                    </summary>
                    <ul className="mt-3 space-y-2 text-sm">
                      {plan.excluded.map((m) => (
                        <li key={m.resource.id} className="text-ink-soft">
                          <span className="font-semibold text-ink">{m.resource.name}</span> —{" "}
                          {m.blockReason}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile sticky footer — profile tab */}
      {tab === "profile" ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 p-4 backdrop-blur-sm print:hidden sm:hidden">
          <button type="button" className="btn btn-primary w-full" onClick={() => setTab("plan")}>
            Generate care plan
          </button>
        </div>
      ) : null}

      {tab === "profile" ? (
        <div className="mx-auto mt-6 hidden max-w-4xl px-4 sm:block sm:px-6 print:hidden">
          <button type="button" className="btn btn-primary w-full" onClick={() => setTab("plan")}>
            Generate care plan
          </button>
        </div>
      ) : null}

      <footer className="mx-auto mt-12 max-w-4xl px-4 pb-8 text-center text-xs text-ink-soft print:hidden sm:px-6">
        Starter data from public county & provider sources — verify hours and eligibility before use.
      </footer>
    </div>
  );
}
