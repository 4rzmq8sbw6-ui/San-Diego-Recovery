import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  Target,
  ShieldAlert,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  INTAKE_SECTIONS,
  emptyIntake,
  sampleIntake,
  type IntakeState,
} from "@/data/intake";
import { buildPlan, NEED_LABELS, type ResourceMatch } from "@/lib/matcher";
import { FieldRow, useIntakeSetter } from "@/components/fields";
import { NeedsSummary, ResourceCard, SeverityDot } from "@/components/plan";

type Props = { onBack: () => void };

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = max ? Math.round((score / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-sand">
        <div
          className="h-full rounded-full"
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
    <div className="mt-2">
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

export function PrototypeC({ onBack }: Props) {
  const [state, setState] = useState<IntakeState>(emptyIntake);
  const [tab, setTab] = useState<"profile" | "plan">("profile");
  const setField = useIntakeSetter(setState);
  const plan = useMemo(() => buildPlan(state), [state]);
  const maxScore = plan.matches[0]?.score ?? 1;

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6">
      <button type="button" className="btn btn-ghost mb-4 text-sm" onClick={onBack}>
        <ArrowLeft size={16} /> All prototypes
      </button>

      <header className="mb-6">
        <span
          className="pill mb-2"
          style={{ background: "var(--color-plum-soft)", color: "#5c3560" }}
        >
          <Target size={14} /> Option C — Care Plan Builder
        </span>
        <h1 className="display text-3xl font-extrabold text-ink">Scored & sequenced plan</h1>
        <p className="text-ink-soft">
          Eligibility gates, severity-weighted scoring, and phased sequencing.
        </p>
      </header>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          className="btn text-sm"
          style={{
            background: tab === "profile" ? "var(--color-plum)" : "transparent",
            color: tab === "profile" ? "#fff" : "var(--color-ink)",
            border: "2px solid var(--color-line)",
          }}
          onClick={() => setTab("profile")}
        >
          1. Profile
        </button>
        <button
          type="button"
          className="btn text-sm"
          style={{
            background: tab === "plan" ? "var(--color-plum)" : "transparent",
            color: tab === "plan" ? "#fff" : "var(--color-ink)",
            border: "2px solid var(--color-line)",
          }}
          onClick={() => setTab("plan")}
        >
          2. Care plan
        </button>
        <button
          type="button"
          className="btn btn-ghost ml-auto text-sm"
          onClick={() => {
            setState(sampleIntake());
            setTab("plan");
          }}
        >
          <Sparkles size={14} /> Sample → plan
        </button>
      </div>

      {tab === "profile" ? (
        <div className="space-y-4">
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
          <button type="button" className="btn btn-primary w-full" onClick={() => setTab("plan")}>
            Generate care plan
          </button>
        </div>
      ) : (
        <div className="space-y-6">
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
                style={{
                  color:
                    plan.headline.tone === "safety" ? "var(--color-coral)" : "var(--color-sun)",
                }}
              />
              <p className="font-semibold">{plan.headline.text}</p>
            </div>
          ) : null}

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

          {plan.phases.map((phase) => (
            <section key={phase.phase}>
              <h3 className="display mb-1 text-xl font-extrabold">{phase.title}</h3>
              <p className="mb-4 text-sm text-ink-soft">{phase.subtitle}</p>
              <div className="space-y-4">
                {phase.matches.map((m, i) => (
                  <div key={m.resource.id}>
                    <div className="mb-1 flex items-center justify-between gap-2 px-1">
                      <span className="text-sm font-bold text-ink-soft">
                        Step {i + 1} · fit score
                      </span>
                      <ScoreBar score={m.score} max={maxScore} />
                    </div>
                    <ResourceCard match={m} rank={i + 1} />
                    <MatchRationale match={m} />
                  </div>
                ))}
              </div>
            </section>
          ))}

          {plan.excluded.length ? (
            <details className="card p-5">
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
        </div>
      )}
    </div>
  );
}
