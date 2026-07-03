import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  Sparkles,
  LayoutGrid,
  List,
} from "lucide-react";
import { RESOURCES } from "@/data/resources";
import type { ServiceCategory } from "@/data/types";
import {
  INTAKE_SECTIONS,
  emptyIntake,
  sampleIntake,
  type IntakeState,
} from "@/data/intake";
import { buildPlan, type ResourceMatch } from "@/lib/matcher";
import { FieldRow, useIntakeSetter } from "@/components/fields";
import { NeedsSummary, ResourceCard } from "@/components/plan";

type Props = { onBack: () => void };

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  "crisis-line": "Crisis line",
  sobering: "Sobering",
  detox: "Detox",
  "residential-sud": "Residential SUD",
  "outpatient-sud": "Outpatient SUD",
  mat: "MAT",
  "crisis-stabilization": "Crisis stabilization",
  shelter: "Shelter",
  housing: "Housing",
  food: "Food",
  "vital-documents": "Vital documents",
  "day-services": "Day services",
  navigation: "Navigation",
};

export function PrototypeB({ onBack }: Props) {
  const [state, setState] = useState<IntakeState>(emptyIntake);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ServiceCategory | "all">("all");
  const [panel, setPanel] = useState<"split" | "directory" | "intake">("split");
  const setField = useIntakeSetter(setState);
  const plan = useMemo(() => buildPlan(state), [state]);

  const matchById = useMemo(
    () => new Map(plan.matches.map((m) => [m.resource.id, m])),
    [plan.matches],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCES.filter((r) => {
      if (category !== "all" && !r.categories.includes(category)) return false;
      if (!q) return true;
      const hay = [r.name, r.program, r.address, r.region, ...r.services].join(" ").toLowerCase();
      return hay.includes(q);
    }).map((r) => {
      const match = matchById.get(r.id);
      return { resource: r, match, score: match?.score ?? 0 };
    }).sort((a, b) => b.score - a.score);
  }, [query, category, matchById]);

  const showIntake = panel !== "directory";
  const showDir = panel !== "intake";

  return (
    <div className="min-h-screen pb-12">
      <div className="border-b border-line bg-paper/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <button type="button" className="btn btn-ghost text-sm" onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </button>
          <span
            className="pill"
            style={{ background: "var(--color-teal-soft)", color: "#125b53" }}
          >
            Option B — Command Center
          </span>
          <div className="ml-auto flex gap-2 lg:hidden">
            <button
              type="button"
              className="btn btn-ghost text-sm"
              data-on={panel === "intake"}
              onClick={() => setPanel("intake")}
            >
              Intake
            </button>
            <button
              type="button"
              className="btn btn-ghost text-sm"
              onClick={() => setPanel("directory")}
            >
              Directory
            </button>
            <button
              type="button"
              className="btn btn-ghost text-sm"
              onClick={() => setPanel("split")}
            >
              Both
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 pt-6 sm:px-6 lg:grid-cols-2">
        {/* Intake panel */}
        {showIntake ? (
          <aside className="space-y-4">
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="display text-xl font-extrabold">De-identified template</h2>
                <button
                  type="button"
                  className="btn btn-ghost text-sm"
                  onClick={() => setState(sampleIntake())}
                >
                  <Sparkles size={14} /> Sample
                </button>
              </div>
              <NeedsSummary needs={plan.needs} />
            </div>

            <div className="card max-h-[70vh] overflow-y-auto p-5">
              {INTAKE_SECTIONS.map((sec) => (
                <details key={sec.id} className="mb-4 border-b border-line pb-4 last:border-0" open>
                  <summary className="display cursor-pointer text-lg font-bold text-ink">
                    {sec.title}
                  </summary>
                  <p className="mb-3 mt-1 text-sm text-ink-soft">{sec.blurb}</p>
                  <div className="space-y-5">
                    {sec.fields.map((f) => (
                      <FieldRow key={f.key} field={f} state={state} setField={setField} />
                    ))}
                  </div>
                </details>
              ))}
            </div>

            {plan.headline ? (
              <div
                className="rounded-2xl px-4 py-3 text-sm font-semibold"
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
          </aside>
        ) : null}

        {/* Directory panel */}
        {showDir ? (
          <main className="space-y-4">
            <div className="card p-4">
              <div className="flex flex-wrap gap-2">
                <div className="relative min-w-[12rem] flex-1">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
                  />
                  <input
                    className="field-input pl-10"
                    placeholder="Search organizations, services…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-ink-soft" />
                  <select
                    className="field-input w-auto min-w-[10rem]"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory | "all")}
                  >
                    <option value="all">All categories</option>
                    {(Object.keys(CATEGORY_LABELS) as ServiceCategory[]).map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mt-2 text-sm text-ink-soft">
                <LayoutGrid size={14} className="mr-1 inline" />
                {filtered.length} resources · sorted by live match score
              </p>
            </div>

            <div className="grid gap-4">
              {filtered.map(({ resource, match, score }) => (
                <div key={resource.id} className="relative">
                  {score > 0 ? (
                    <span
                      className="absolute -right-1 -top-2 z-10 pill shadow-sm"
                      style={{ background: "var(--color-sun)", color: "#4a2f05" }}
                    >
                      Match {score}
                    </span>
                  ) : null}
                  {match ? (
                    <ResourceCard match={match} compact />
                  ) : (
                    <ResourceCard
                      match={
                        {
                          resource,
                          score: 0,
                          matchedNeeds: [],
                          flags: [],
                          eligible: true,
                        } satisfies ResourceMatch
                      }
                      compact
                    />
                  )}
                </div>
              ))}
            </div>

            {plan.matches.length ? (
              <div className="card p-5">
                <h3 className="display mb-3 flex items-center gap-2 text-lg font-extrabold">
                  <List size={18} /> Top plan ({plan.matches.length})
                </h3>
                <ol className="space-y-3">
                  {plan.matches.slice(0, 5).map((m, i) => (
                    <li key={m.resource.id} className="flex gap-3 text-sm">
                      <span className="display font-extrabold text-sun">{i + 1}.</span>
                      <span>
                        <span className="font-bold">{m.resource.name}</span>
                        <span className="text-ink-soft"> — {m.resource.phone}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </main>
        ) : null}
      </div>
    </div>
  );
}
