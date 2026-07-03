import {
  Clock,
  Phone,
  MapPin,
  ExternalLink,
  Mail,
  AlertTriangle,
  Info,
  Footprints,
  PhoneCall,
} from "lucide-react";
import type { Resource } from "@/data/types";
import {
  NEED_LABELS,
  isEmail,
  telHref,
  type CarePlan,
  type DerivedNeed,
  type ResourceMatch,
} from "@/lib/matcher";

const NEED_TONE: Record<number, string> = {
  1: "var(--color-sky-soft)",
  2: "var(--color-sun-soft)",
  3: "var(--color-coral-soft)",
};

export function SeverityDot({ severity }: { severity: number }) {
  const color =
    severity >= 3 ? "var(--color-coral)" : severity === 2 ? "var(--color-sun)" : "var(--color-sky)";
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ background: color }}
      aria-hidden
    />
  );
}

export function NeedsSummary({ needs }: { needs: DerivedNeed[] }) {
  if (!needs.length)
    return (
      <p className="text-ink-soft">
        Fill out the template and the matched needs will appear here.
      </p>
    );
  return (
    <div className="flex flex-wrap gap-2">
      {needs.map((n) => (
        <span
          key={n.tag}
          className="pill"
          style={{ background: NEED_TONE[n.severity], color: "var(--color-ink)" }}
          title={n.reason}
        >
          <SeverityDot severity={n.severity} />
          {n.label}
        </span>
      ))}
    </div>
  );
}

function ContactLine({ phone, label }: { phone: string; label?: string }) {
  const email = isEmail(phone);
  return (
    <a
      href={email ? `mailto:${phone}` : telHref(phone)}
      className="inline-flex items-center gap-2 font-bold text-teal hover:underline"
    >
      {email ? <Mail size={16} /> : <Phone size={16} />}
      <span>{phone}</span>
      {label ? <span className="text-sm font-medium text-ink-soft">· {label}</span> : null}
    </a>
  );
}

export function ResourceCard({
  match,
  rank,
  compact = false,
}: {
  match: ResourceMatch;
  rank?: number;
  compact?: boolean;
}) {
  const r: Resource = match.resource;
  return (
    <article className="card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        {rank ? (
          <span
            className="display grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg font-extrabold"
            style={{ background: "var(--color-teal)", color: "#fff" }}
          >
            {rank}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="display text-lg font-extrabold leading-tight text-ink">{r.name}</h3>
          {r.program ? <p className="text-sm text-ink-soft">{r.program}</p> : null}
        </div>
        {r.walkIn ? (
          <span
            className="pill shrink-0"
            style={{ background: "var(--color-leaf-soft)", color: "#2f5e26" }}
          >
            <Footprints size={14} /> Walk-in
          </span>
        ) : null}
      </div>

      {match.matchedNeeds.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {match.matchedNeeds.map((tag) => (
            <span
              key={tag}
              className="pill"
              style={{ background: "var(--color-teal-soft)", color: "#125b53", fontSize: "0.72rem" }}
            >
              {NEED_LABELS[tag]}
            </span>
          ))}
        </div>
      ) : null}

      {!compact ? (
        <ul className="mt-3 space-y-1 text-sm text-ink-soft">
          {r.services.slice(0, compact ? 2 : 4).map((s) => (
            <li key={s} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
        <ContactLine phone={r.phone} label={r.phoneLabel} />
        {r.altPhone ? (
          <div>
            <ContactLine phone={r.altPhone} label={r.altPhoneLabel} />
          </div>
        ) : null}
        <p className="flex items-start gap-2 text-ink">
          <Clock size={16} className="mt-0.5 shrink-0 text-ink-soft" />
          <span>{r.hours}</span>
        </p>
        {r.bestTimeToCall ? (
          <p className="flex items-start gap-2 text-ink">
            <PhoneCall size={16} className="mt-0.5 shrink-0 text-ink-soft" />
            <span>
              <span className="font-bold">Best time: </span>
              {r.bestTimeToCall}
            </span>
          </p>
        ) : null}
        {r.address ? (
          <p className="flex items-start gap-2 text-ink-soft">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            <span>
              {r.address}
              {r.region ? ` · ${r.region}` : ""}
            </span>
          </p>
        ) : null}
      </div>

      {match.flags.length ? (
        <div className="mt-3 space-y-1.5">
          {match.flags.map((f, i) => (
            <p
              key={i}
              className="flex items-start gap-2 rounded-xl px-3 py-2 text-sm"
              style={{
                background: f.tone === "caution" ? "var(--color-coral-soft)" : "var(--color-sky-soft)",
                color: "var(--color-ink)",
              }}
            >
              {f.tone === "caution" ? (
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              ) : (
                <Info size={15} className="mt-0.5 shrink-0" />
              )}
              <span>{f.text}</span>
            </p>
          ))}
        </div>
      ) : null}

      {(r.intakeUrl || r.website) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {r.intakeUrl ? (
            <a className="btn btn-primary text-sm" href={r.intakeUrl} target="_blank" rel="noreferrer">
              Intake form <ExternalLink size={15} />
            </a>
          ) : null}
          {r.website ? (
            <a className="btn btn-ghost text-sm" href={r.website} target="_blank" rel="noreferrer">
              Website <ExternalLink size={15} />
            </a>
          ) : null}
        </div>
      )}

      {r.needsVerification ? (
        <p className="mt-3 text-xs font-semibold text-coral">⚠ Verify details before use</p>
      ) : null}
    </article>
  );
}

export function PhasedPlan({ plan }: { plan: CarePlan }) {
  if (!plan.phases.length)
    return (
      <div className="card p-6 text-ink-soft">
        No matching resources yet — add a few more details to the template.
      </div>
    );

  let rank = 0;
  return (
    <div className="space-y-8">
      {plan.phases.map((phase) => (
        <section key={phase.phase}>
          <div className="mb-3 flex items-baseline gap-3">
            <h3 className="display text-xl font-extrabold text-ink">{phase.title}</h3>
            <p className="text-sm text-ink-soft">{phase.subtitle}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {phase.matches.map((m) => {
              rank += 1;
              return <ResourceCard key={m.resource.id} match={m} rank={rank} />;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
