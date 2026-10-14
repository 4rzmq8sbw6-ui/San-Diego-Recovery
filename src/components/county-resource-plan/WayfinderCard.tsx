import { Clock, ExternalLink, MapPin, Phone, ShieldCheck, User } from "lucide-react";
import { telHref } from "@/lib/county-resource-plan/format";

export function WayfinderCard({
  eyebrow,
  title,
  badges = [],
  services,
  phones,
  hours,
  contact,
  place,
  bestTime,
  note,
  reasons,
  cautions = [],
  links = [],
  crewOnly = false,
}: {
  eyebrow: string;
  title: string;
  badges?: string[];
  services: string[];
  phones: { label: string; number: string }[];
  hours: string;
  contact: string;
  place?: string;
  bestTime: string;
  note?: string;
  reasons?: string[];
  cautions?: string[];
  links?: { label: string; href: string }[];
  crewOnly?: boolean;
}) {
  return (
    <article className="cp-glass rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:border-[color:var(--cp-primary)]/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--cp-teal)" }}
          >
            {eyebrow}
          </p>
          <h3 className="mt-1 text-xl leading-tight">{title}</h3>
          {crewOnly ? (
            <p
              className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--cp-crisis)" }}
            >
              Crew step, not a public number
            </p>
          ) : null}
        </div>
        {badges.length > 0 ? (
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full px-2 py-0.5 text-[10px]"
                style={{ background: "var(--cp-secondary)", color: "var(--cp-secondary-fg)" }}
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {services.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {services.map((service) => (
            <span
              key={service}
              className="rounded-md border px-2 py-0.5 text-xs"
              style={{ borderColor: "var(--cp-border)", color: "var(--cp-muted-fg)" }}
            >
              {service}
            </span>
          ))}
        </div>
      ) : null}

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {phones.length > 0 ? (
          phones.map((phone) => (
            <a
              key={`${phone.label}-${phone.number}`}
              href={telHref(phone.number)}
              className="flex items-center gap-2 font-semibold"
              style={{ color: "var(--cp-primary)" }}
            >
              <Phone className="h-4 w-4 shrink-0" />
              <span>
                {phone.number}
                <span className="ml-1 font-normal" style={{ color: "var(--cp-muted-fg)" }}>
                  {phone.label}
                </span>
              </span>
            </a>
          ))
        ) : (
          <p className="font-semibold">No public phone. Use the department channel.</p>
        )}
        <div className="flex items-start gap-2" style={{ color: "var(--cp-muted-fg)" }}>
          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{hours}</span>
        </div>
        <div className="flex items-start gap-2" style={{ color: "var(--cp-muted-fg)" }}>
          <User className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{contact}</span>
        </div>
        {place ? (
          <div className="flex items-start gap-2" style={{ color: "var(--cp-muted-fg)" }}>
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{place}</span>
          </div>
        ) : null}
      </dl>

      <p className="mt-3 text-sm">
        <span style={{ color: "var(--cp-muted-fg)" }}>Best time to contact: </span>
        {bestTime}
      </p>
      {note ? (
        <p className="mt-1 flex gap-2 text-sm" style={{ color: "var(--cp-muted-fg)" }}>
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--cp-teal)" }} />
          <span>{note}</span>
        </p>
      ) : null}
      {cautions.map((caution) => (
        <p
          key={caution}
          className="mt-2 rounded-lg px-3 py-2 text-xs"
          style={{
            background: "color-mix(in oklab, var(--cp-crisis) 15%, transparent)",
            color: "var(--cp-fg)",
          }}
        >
          {caution}
        </p>
      ))}
      {reasons && reasons.length > 0 ? (
        <p
          className="mt-3 rounded-lg px-3 py-2 text-xs"
          style={{ background: "color-mix(in oklab, var(--cp-accent) 40%, transparent)" }}
        >
          Matches: {reasons.slice(0, 4).join(" · ")}
        </p>
      ) : null}
      {links.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {links.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:underline"
              style={{ color: index === 0 ? "var(--cp-primary)" : "var(--cp-muted-fg)" }}
            >
              {link.label} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}
