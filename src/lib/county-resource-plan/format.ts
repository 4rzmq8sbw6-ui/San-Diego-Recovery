import type { PersonProfile, ResourcePlan } from "@/lib/county-resource-plan/types";
import { PHASE_LABELS, describePerson } from "@/lib/county-resource-plan/match";
import { RESOURCE_DIRECTORY_REVIEWED } from "@/lib/county-resource-plan/resources";

export function telHref(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}

export function planToText(profile: PersonProfile, plan: ResourcePlan): string {
  const lines: string[] = [
    "SAN DIEGO COUNTY RESOURCE PLAN",
    "De-identified field aid. No name is included. Confirm hours and bed space before transport.",
    `Directory checked ${RESOURCE_DIRECTORY_REVIEWED}.`,
    "",
  ];

  const about = describePerson(profile);
  if (about.length > 0) {
    lines.push("CHECKED");
    for (const line of about) lines.push(`- ${line}`);
    lines.push("");
  }

  if (plan.safety) {
    lines.push(`FIRST: ${plan.safety}`, "");
  }
  for (const gap of plan.gaps) lines.push(`Gap: ${gap}`);
  if (plan.gaps.length > 0) lines.push("");
  for (const note of plan.notes) lines.push(`Note: ${note}`);
  if (plan.notes.length > 0) lines.push("");

  let number = 1;
  let lastPhase = "";
  for (const step of plan.steps) {
    if (step.phase !== lastPhase) {
      lastPhase = step.phase;
      lines.push(PHASE_LABELS[step.phase].title.toUpperCase());
    }
    const phone = step.location?.phone ?? step.resource.phones[0]?.number ?? "No public number";
    lines.push(`${number}. ${step.resource.name}`);
    lines.push(`   Why: ${step.why.join(" ")}`);
    lines.push(`   Call: ${phone}`);
    if (step.location?.address || step.resource.address) {
      lines.push(`   Where: ${step.location?.address ?? step.resource.address}`);
    }
    lines.push(`   Hours: ${step.location?.hours ?? step.resource.hours}`);
    lines.push(`   Best time: ${step.resource.bestTimeToCall}`);
    lines.push(`   Ask for: ${step.resource.pointOfContact}`);
    lines.push(`   Say: ${step.resource.sayWhenYouCall}`);
    for (const caution of step.cautions) lines.push(`   Caution: ${caution}`);
    for (const link of step.resource.links) lines.push(`   ${link.label}: ${link.href}`);
    lines.push("");
    number += 1;
  }

  if (plan.alreadyConnected.length > 0) {
    lines.push("ALREADY CONNECTED — call only if that link fell through");
    for (const step of plan.alreadyConnected) {
      const phone = step.location?.phone ?? step.resource.phones[0]?.number ?? "No public number";
      lines.push(`- ${step.resource.name}: ${phone}`);
    }
    lines.push("");
  }

  if (plan.ruledOut.length > 0) {
    lines.push("LEFT OFF");
    for (const item of plan.ruledOut) lines.push(`- ${item.name}: ${item.reason}`);
    lines.push("");
  }

  lines.push("This is not a clinical assessment and it does not reserve a bed.");
  return lines.join("\n");
}
