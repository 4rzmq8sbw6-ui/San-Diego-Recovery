import { Check } from "lucide-react";
import type { IntakeField, IntakeState } from "@/data/intake";

export type SetField = (key: string, value: string | string[] | number | undefined) => void;

export function useIntakeSetter(
  setState: React.Dispatch<React.SetStateAction<IntakeState>>,
): SetField {
  return (key, value) => setState((prev) => ({ ...prev, [key]: value }));
}

function toggleInArray(list: string[], value: string): string[] {
  // "none" is mutually exclusive with real answers.
  if (value === "none") return list.includes("none") ? [] : ["none"];
  const withoutNone = list.filter((v) => v !== "none");
  return withoutNone.includes(value)
    ? withoutNone.filter((v) => v !== value)
    : [...withoutNone, value];
}

export function FieldControl({
  field,
  state,
  setField,
}: {
  field: IntakeField;
  state: IntakeState;
  setField: SetField;
}) {
  const value = state[field.key];

  if (field.kind === "number") {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          className="field-input max-w-[10rem]"
          placeholder={field.placeholder}
          value={typeof value === "number" ? value : ""}
          onChange={(e) =>
            setField(field.key, e.target.value === "" ? undefined : Number(e.target.value))
          }
        />
        {field.suffix ? <span className="text-ink-soft font-semibold">{field.suffix}</span> : null}
      </div>
    );
  }

  if (field.kind === "text") {
    return (
      <textarea
        className="field-input min-h-[3rem] resize-y"
        rows={2}
        placeholder={field.placeholder}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => setField(field.key, e.target.value)}
      />
    );
  }

  const selected: string[] = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? [value]
      : [];

  return (
    <div className="flex flex-wrap gap-2">
      {field.options?.map((opt) => {
        const on = selected.includes(opt.value);
        return (
          <button
            type="button"
            key={opt.value}
            className="chip"
            data-on={on}
            aria-pressed={on}
            onClick={() => {
              if (field.kind === "multi") {
                const current = Array.isArray(value) ? value : [];
                setField(field.key, toggleInArray(current, opt.value));
              } else {
                setField(field.key, on ? undefined : opt.value);
              }
            }}
          >
            <span
              className="grid h-5 w-5 place-items-center rounded-full border-2"
              style={{
                borderColor: on ? "var(--color-teal)" : "var(--color-line)",
                background: on ? "var(--color-teal)" : "transparent",
              }}
            >
              {on ? <Check size={13} strokeWidth={3.5} color="#fff" /> : null}
            </span>
            <span className="leading-tight text-left">
              {opt.label}
              {opt.hint ? (
                <span className="block text-xs font-medium text-ink-soft">{opt.hint}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function FieldRow({
  field,
  state,
  setField,
}: {
  field: IntakeField;
  state: IntakeState;
  setField: SetField;
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="display text-[1.02rem] font-bold text-ink">{field.label}</label>
        {field.help ? <p className="text-sm text-ink-soft">{field.help}</p> : null}
      </div>
      <FieldControl field={field} state={state} setField={setField} />
    </div>
  );
}
