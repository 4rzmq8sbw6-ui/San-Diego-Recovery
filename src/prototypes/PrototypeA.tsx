import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Sun,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import {
  ALL_FIELDS,
  INTAKE_SECTIONS,
  answeredCount,
  emptyIntake,
  sampleIntake,
  type IntakeState,
} from "@/data/intake";
import { buildPlan } from "@/lib/matcher";
import { FieldRow, useIntakeSetter } from "@/components/fields";
import { NeedsSummary, PhasedPlan } from "@/components/plan";

type Props = { onBack: () => void };

export function PrototypeA({ onBack }: Props) {
  const [state, setState] = useState<IntakeState>(emptyIntake);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const setField = useIntakeSetter(setState);
  const plan = useMemo(() => buildPlan(state), [state]);

  const totalSteps = INTAKE_SECTIONS.length + 1; // +1 for plan
  const isPlanStep = step >= INTAKE_SECTIONS.length;
  const section = INTAKE_SECTIONS[step];
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-6 sm:px-6">
      <button type="button" className="btn btn-ghost mb-4 text-sm" onClick={onBack}>
        <ArrowLeft size={16} /> All prototypes
      </button>

      <header className="mb-6 text-center">
        <span
          className="pill mb-2"
          style={{ background: "var(--color-sun-soft)", color: "#5a3c05" }}
        >
          <Sun size={14} /> Option A — Guided Journey
        </span>
        <h1 className="display text-3xl font-extrabold text-ink">One step at a time</h1>
        <p className="mt-1 text-ink-soft">
          Warm, mobile-first wizard — built for sitting beside someone.
        </p>
      </header>

      {/* Progress */}
      <div className="mb-6">
        <div className="mb-1 flex justify-between text-sm font-semibold text-ink-soft">
          <span>{isPlanStep ? "Your care plan" : section.title}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-sand">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "var(--color-sun)" }}
          />
        </div>
      </div>

      <div className="card p-5 sm:p-8">
        {!isPlanStep ? (
          <>
            <p className="mb-6 text-ink-soft">{section.blurb}</p>
            <div className="space-y-6">
              {section.fields.map((f) => (
                <FieldRow key={f.key} field={f} state={state} setField={setField} />
              ))}
            </div>
          </>
        ) : (
          <>
            {plan.headline ? (
              <div
                className="mb-5 rounded-2xl px-4 py-3 text-sm font-semibold"
                style={{
                  background:
                    plan.headline.tone === "safety"
                      ? "var(--color-coral-soft)"
                      : "var(--color-sun-soft)",
                }}
              >
                {plan.headline.text}
              </div>
            ) : null}
            <div className="mb-5">
              <h2 className="display mb-2 text-lg font-extrabold">Matched needs</h2>
              <NeedsSummary needs={plan.needs} />
            </div>
            <PhasedPlan plan={plan} />
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-ghost text-sm"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            type="button"
            className="btn btn-ghost text-sm"
            onClick={() => {
              setState(sampleIntake());
              setStep(INTAKE_SECTIONS.length);
              setDone(true);
            }}
          >
            <Sparkles size={16} /> Load sample
          </button>
        </div>
        {!isPlanStep ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setStep((s) => s + 1)}
          >
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setState(emptyIntake());
              setStep(0);
              setDone(false);
            }}
          >
            <RotateCcw size={16} /> Start over
          </button>
        )}
      </div>

      {done && isPlanStep ? (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-leaf">
          <CheckCircle2 size={16} /> Plan ready — no PHI stored
        </p>
      ) : null}

      <p className="mt-8 text-center text-xs text-ink-soft">
        {answeredCount(state)} of {ALL_FIELDS.length} fields answered
      </p>
    </div>
  );
}
