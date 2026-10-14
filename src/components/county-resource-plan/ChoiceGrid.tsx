import { Check } from "lucide-react";

interface Choice {
  id: string;
  label: string;
  hint?: string;
}

export function ChoiceGrid({
  legend,
  options,
  selected,
  onToggle,
  mode = "multi",
}: {
  legend: string;
  options: Choice[];
  selected: string[];
  onToggle: (id: string) => void;
  mode?: "single" | "multi";
}) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const on = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              className="cp-choice"
              data-on={on}
              aria-pressed={on}
              onClick={() => onToggle(option.id)}
            >
              <span className={mode === "single" ? "cp-mark cp-mark-round" : "cp-mark"}>
                {on ? <Check size={12} strokeWidth={3} /> : null}
              </span>
              <span>
                {option.label}
                {option.hint ? <span className="cp-choice-hint">{option.hint}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
