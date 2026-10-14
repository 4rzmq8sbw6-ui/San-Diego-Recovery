import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { WayfinderCard } from "@/components/county-resource-plan/WayfinderCard";
import {
  COUNTY_RESOURCES,
  RESOURCE_DIRECTORY_REVIEWED,
  SERVICE_LABELS,
} from "@/lib/county-resource-plan/resources";
import type { CountyResource, ResourceGroup } from "@/lib/county-resource-plan/types";

const GROUPS: ResourceGroup[] = [
  "Crisis",
  "Substance use",
  "Housing and daytime",
  "Food, benefits, and papers",
  "Health",
  "Crew programs",
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

export function ResourceDirectory() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<ResourceGroup | "all">("all");

  const resources = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return COUNTY_RESOURCES.filter((resource) => {
      if (group !== "all" && resource.group !== group) return false;
      if (!needle) return true;
      const haystack = [
        resource.name,
        resource.summary,
        resource.address ?? "",
        ...resource.offers,
        ...resource.services.map((service) => SERVICE_LABELS[service]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [group, query]);

  return (
    <div>
      <p className="text-sm" style={{ color: "var(--cp-muted-fg)" }}>
        {resources.length} shown. Checked {RESOURCE_DIRECTORY_REVIEWED}. This is the list the plan
        filters. It is not a live bed board.
      </p>
      <div className="cp-search mt-8">
        <Search className="h-4 w-4 shrink-0" style={{ color: "var(--cp-muted-fg)" }} />
        <input
          id="resource-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search detox, shelter, MAT, ID…"
          aria-label="Search the county list"
        />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          className="cp-filter"
          data-on={group === "all"}
          onClick={() => setGroup("all")}
        >
          All
        </button>
        {GROUPS.map((item) => (
          <button
            key={item}
            type="button"
            className="cp-filter"
            data-on={group === item}
            onClick={() => setGroup(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {resources.map((resource) => (
          <WayfinderCard
            key={resource.id}
            eyebrow={resource.group}
            title={resource.name}
            badges={badgesFor(resource)}
            services={resource.offers.slice(0, 5)}
            phones={resource.phones}
            hours={resource.hours}
            contact={resource.pointOfContact}
            place={
              resource.address ??
              resource.regions.map((region) => PLACE[region] ?? region).join(" · ")
            }
            bestTime={resource.bestTimeToCall}
            note={resource.requirements[0]}
            links={resource.links}
            crewOnly={resource.crewOnly}
          />
        ))}
      </div>
    </div>
  );
}
