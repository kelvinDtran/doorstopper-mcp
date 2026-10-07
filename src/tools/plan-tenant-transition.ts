import { z } from "zod";
import { addDays, clampDate, diffDays, formatDate, parseDate } from "./dates.js";
import { ToolInputError, type ToolDef, type ToolOutput } from "./types.js";

const dateField = (what: string) =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .describe(what);

const inputSchema = {
  notice_date: dateField("Date the tenant's notice was received, YYYY-MM-DD."),
  lease_end_date: dateField("Lease end (move-out) date, YYYY-MM-DD."),
  target_move_in_date: dateField("Optional. Date you want the next tenant to move in, YYYY-MM-DD.").optional(),
  make_ready_days: z
    .number()
    .int()
    .min(0)
    .max(120)
    .default(7)
    .describe("Days needed after move-out to make the unit ready. Defaults to 7."),
  unit_label: z.string().min(1).max(120).optional().describe("Optional label for the unit, for example 4A Linden Flats."),
};

export const DECIDED_BY = "your licensed team";
export const NOTE = "DoorStopper does not perform leasing acts or decide applications.";

export interface TransitionInput {
  notice_date: string;
  lease_end_date: string;
  target_move_in_date?: string;
  make_ready_days?: number;
  unit_label?: string;
}

interface Step {
  order: number;
  step: string;
  date: string;
  end_date?: string;
  detail: string;
  decided_by?: string;
}

export function planTenantTransition(input: TransitionInput): ToolOutput {
  const makeReadyDays = input.make_ready_days ?? 7;
  const notice = parseDate(input.notice_date, "notice_date");
  const leaseEnd = parseDate(input.lease_end_date, "lease_end_date");
  const target = input.target_move_in_date ? parseDate(input.target_move_in_date, "target_move_in_date") : undefined;

  if (leaseEnd < notice) throw new ToolInputError("lease_end_date is before notice_date. Check the dates and try again.");
  if (target && target < notice) {
    throw new ToolInputError("target_move_in_date is before notice_date. Check the dates and try again.");
  }

  const ready = addDays(leaseEnd, makeReadyDays); // make-ready complete
  const moveIn = target ?? addDays(ready, 1);

  const warnings: string[] = [];
  if (target) {
    if (target < ready) {
      warnings.push(
        `Overlap: the target move-in (${formatDate(target)}) is ${diffDays(ready, target)} day(s) before lease end plus make-ready days (${formatDate(ready)}). Shorten make-ready, move the target, or plan for an overlap.`,
      );
    } else if (diffDays(target, ready) > 14) {
      warnings.push(
        `Gap: the target move-in (${formatDate(target)}) is ${diffDays(target, ready)} days after make-ready is complete (${formatDate(ready)}). The unit would sit ready and vacant for that time.`,
      );
    }
  }

  const ownerInformed = clampDate(addDays(notice, 1), notice, leaseEnd);
  const inspectionScheduled = clampDate(addDays(notice, 2), notice, leaseEnd);
  const makeReadyScoping = clampDate(addDays(leaseEnd, -7), addDays(notice, 3), leaseEnd);
  const listingPrep = clampDate(addDays(leaseEnd, -21), addDays(notice, 2), leaseEnd);
  const showingsStart = clampDate(addDays(listingPrep, 3), listingPrep, moveIn);
  const leaseSigned = clampDate(addDays(moveIn, -3), showingsStart, moveIn);
  const showingsEnd = clampDate(addDays(leaseSigned, -3), showingsStart, leaseSigned);
  const applicationsReviewed = clampDate(addDays(leaseSigned, -2), showingsStart, leaseSigned);

  const drafts: Omit<Step, "order">[] = [
    {
      step: "Notice received and logged",
      date: formatDate(notice),
      detail: "Record the notice, the lease end date and the unit in your PMS.",
    },
    {
      step: "Owner informed",
      date: formatDate(ownerInformed),
      detail: "Tell the property owner the unit is turning and when. Use draft_owner_update for a draft.",
    },
    {
      step: "Move-out inspection scheduled",
      date: formatDate(inspectionScheduled),
      detail: `Schedule the move-out inspection for the lease end date (${formatDate(leaseEnd)}).`,
    },
    {
      step: "Make-ready scope and vendor scheduling",
      date: formatDate(makeReadyScoping),
      end_date: formatDate(ready),
      detail: `Scope the work after the move-out inspection and book vendors for the make-ready window (${formatDate(addDays(leaseEnd, 1))} to ${formatDate(ready)}, ${makeReadyDays} day(s)).`,
    },
    {
      step: "Listing preparation",
      date: formatDate(listingPrep),
      detail: "Prepare the listing for review and approval.",
      decided_by: DECIDED_BY,
    },
    {
      step: "Showings",
      date: formatDate(showingsStart),
      end_date: formatDate(showingsEnd),
      detail: "Schedule and run showings against the posted criteria.",
      decided_by: DECIDED_BY,
    },
    {
      step: "Applications reviewed",
      date: formatDate(applicationsReviewed),
      detail:
        "Review applications and screening results against the posted criteria; the decision is made by people, not by this plan.",
      decided_by: DECIDED_BY,
    },
    {
      step: "Lease signed",
      date: formatDate(leaseSigned),
      detail: "Prepare and sign the lease for the new tenant.",
      decided_by: DECIDED_BY,
    },
    {
      step: "Move-in",
      date: formatDate(moveIn),
      detail: target
        ? "Move-in on the target date you gave."
        : "Earliest move-in: the day after make-ready is complete.",
    },
  ];
  // Chronological order; ties keep the logical order above (Array.prototype.sort is stable).
  const steps: Step[] = [...drafts]
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map((s, i) => ({ order: i + 1, ...s }));

  const label = input.unit_label ? ` for ${input.unit_label}` : "";
  const structured: Record<string, unknown> = {
    ...(input.unit_label ? { unit_label: input.unit_label } : {}),
    notice_date: formatDate(notice),
    lease_end_date: formatDate(leaseEnd),
    make_ready_days: makeReadyDays,
    make_ready_complete_date: formatDate(ready),
    ...(target ? { target_move_in_date: formatDate(target) } : {}),
    planned_move_in_date: formatDate(moveIn),
    steps,
    warnings,
    note: NOTE,
  };
  const summary = [
    `Transition plan${label}: ${steps.length} steps from ${formatDate(notice)} to move-in on ${formatDate(moveIn)}.`,
    ...warnings,
    NOTE,
  ].join(" ");
  return { structured, summary };
}

export const planTenantTransitionTool: ToolDef = {
  name: "plan_tenant_transition",
  title: "Plan tenant transition",
  description:
    "Build a dated checklist from a tenant's notice to the next lease and move-in, from dates you provide. Leasing acts (listing, showings, application decisions, screening, lease signing) are marked as decided by your licensed team. Warns if the target move-in overlaps make-ready or leaves a long gap.",
  inputSchema,
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  handler: planTenantTransition,
};
