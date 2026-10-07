import { z } from "zod";
import type { ToolDef, ToolOutput } from "./types.js";

const inputSchema = {
  monthly_rent: z.number().positive().max(100_000).describe("Monthly rent for the unit, in USD, as you enter it."),
  vacant_days: z.number().min(0).max(730).describe("Days the unit sits vacant between tenants."),
  make_ready_cost: z.number().min(0).max(1_000_000).describe("Cost to make the unit ready, in USD (cleaning, paint, repairs)."),
  leasing_and_marketing_cost: z.number().min(0).max(1_000_000).default(0).describe("Leasing and marketing cost for the turn, in USD. Defaults to 0."),
  concessions: z.number().min(0).max(1_000_000).default(0).describe("Concessions offered to the new tenant, in USD. Defaults to 0."),
  turns_per_year_across_portfolio: z.number().positive().max(100_000).optional().describe("Optional. How many turns like this one you expect across the portfolio in a year, to annualize the result."),
};

const FORMULA = {
  lost_rent: "lost_rent = monthly_rent x 12 / 365 x vacant_days",
  direct_costs: "direct_costs = make_ready_cost + leasing_and_marketing_cost + concessions",
  total_per_turn: "total_per_turn = lost_rent + direct_costs",
  annualized_total: "annualized_total = total_per_turn x turns_per_year_across_portfolio",
};

export const NOTE = "Illustrative arithmetic from the numbers you entered. Not a benchmark or a DoorStopper result.";

const cents = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export interface TurnoverInput {
  monthly_rent: number;
  vacant_days: number;
  make_ready_cost: number;
  leasing_and_marketing_cost?: number;
  concessions?: number;
  turns_per_year_across_portfolio?: number;
}

export function estimateTurnoverCost(input: TurnoverInput): ToolOutput {
  const leasing = input.leasing_and_marketing_cost ?? 0;
  const concessions = input.concessions ?? 0;
  const lost_rent = cents(((input.monthly_rent * 12) / 365) * input.vacant_days);
  const direct_costs = cents(input.make_ready_cost + leasing + concessions);
  const total_per_turn = cents(lost_rent + direct_costs);
  const turns = input.turns_per_year_across_portfolio;
  const annualized_total = turns === undefined ? undefined : cents(total_per_turn * turns);

  const structured: Record<string, unknown> = {
    currency: "USD",
    lost_rent,
    direct_costs,
    total_per_turn,
    ...(annualized_total === undefined ? {} : { annualized_total, turns_per_year_across_portfolio: turns }),
    formula: annualized_total === undefined
      ? [FORMULA.lost_rent, FORMULA.direct_costs, FORMULA.total_per_turn]
      : [FORMULA.lost_rent, FORMULA.direct_costs, FORMULA.total_per_turn, FORMULA.annualized_total],
    note: NOTE,
  };

  const lines = [
    `Lost rent: ${fmt(lost_rent)} USD. Direct costs: ${fmt(direct_costs)} USD. Total for this turn: ${fmt(total_per_turn)} USD.`,
  ];
  if (annualized_total !== undefined) {
    lines.push(`Across ${turns} turns a year: ${fmt(annualized_total)} USD.`);
  }
  lines.push(NOTE);
  return { structured, summary: lines.join(" ") };
}

export const estimateTurnoverCostTool: ToolDef = {
  name: "estimate_turnover_cost",
  title: "Estimate turnover cost",
  description:
    "Calculate what one tenant turnover costs from numbers you provide: lost rent while vacant plus make-ready, leasing and marketing costs and concessions. Optionally annualize across a portfolio. Pure arithmetic on your inputs; no benchmarks.",
  inputSchema,
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  handler: estimateTurnoverCost,
};
