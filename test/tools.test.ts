import assert from "node:assert/strict";
import { test } from "node:test";
import { draftOwnerUpdate, DRAFT_NOTICE } from "../src/tools/draft-owner-update.js";
import { estimateTurnoverCost, NOTE as COST_NOTE } from "../src/tools/estimate-turnover-cost.js";
import { BOUNDARY_LINE, COMPANY_LINE, getPortfolioReview, REVIEW_URL } from "../src/tools/get-portfolio-review.js";
import { DECIDED_BY, NOTE as PLAN_NOTE, planTenantTransition } from "../src/tools/plan-tenant-transition.js";
import { ToolInputError } from "../src/tools/types.js";

test("estimate_turnover_cost: arithmetic is exact and rounded to cents", () => {
  const { structured } = estimateTurnoverCost({
    monthly_rent: 2000,
    vacant_days: 30,
    make_ready_cost: 1000,
    leasing_and_marketing_cost: 200,
    concessions: 100,
    turns_per_year_across_portfolio: 10,
  });
  // 2000 * 12 / 365 * 30 = 1972.60 (rounded)
  assert.equal(structured.lost_rent, 1972.6);
  assert.equal(structured.direct_costs, 1300);
  assert.equal(structured.total_per_turn, 3272.6);
  assert.equal(structured.annualized_total, 32726);
  assert.equal(structured.currency, "USD");
  assert.equal(structured.note, COST_NOTE);
  assert.ok(Array.isArray(structured.formula) && structured.formula.length === 4);
});

test("estimate_turnover_cost: defaults and omitted annualization", () => {
  const { structured, summary } = estimateTurnoverCost({ monthly_rent: 1500, vacant_days: 0, make_ready_cost: 500 });
  assert.equal(structured.lost_rent, 0);
  assert.equal(structured.direct_costs, 500);
  assert.equal(structured.total_per_turn, 500);
  assert.equal("annualized_total" in structured, false);
  assert.match(summary, /Illustrative arithmetic/);
});

test("plan_tenant_transition: nine ordered steps, leasing acts carry decided_by", () => {
  const { structured } = planTenantTransition({ notice_date: "2026-11-02", lease_end_date: "2026-12-31" });
  const steps = structured.steps as Array<{ step: string; date: string; decided_by?: string }>;
  assert.equal(steps.length, 9);
  assert.equal(steps[0]!.step, "Notice received and logged");
  assert.equal(steps[0]!.date, "2026-11-02");
  assert.equal(steps[8]!.step, "Move-in");
  assert.equal(steps[8]!.date, "2027-01-08"); // lease end + 7 + 1
  for (const s of steps) {
    const leasing = ["Listing preparation", "Showings", "Applications reviewed", "Lease signed"].includes(s.step);
    assert.equal(s.decided_by, leasing ? DECIDED_BY : undefined, s.step);
  }
  assert.equal(structured.note, PLAN_NOTE);
  assert.deepEqual(structured.warnings, []);
  // dates never decrease
  const dates = steps.map((s) => s.date);
  assert.deepEqual([...dates].sort(), dates);
});

test("plan_tenant_transition: warns on overlap and on a long gap", () => {
  const overlap = planTenantTransition({
    notice_date: "2026-11-02",
    lease_end_date: "2026-12-31",
    target_move_in_date: "2027-01-02",
    make_ready_days: 10,
  });
  assert.equal((overlap.structured.warnings as string[]).length, 1);
  assert.match((overlap.structured.warnings as string[])[0]!, /Overlap/);

  const gap = planTenantTransition({
    notice_date: "2026-11-02",
    lease_end_date: "2026-12-31",
    target_move_in_date: "2027-03-01",
  });
  assert.match((gap.structured.warnings as string[])[0]!, /Gap/);

  const ok = planTenantTransition({
    notice_date: "2026-11-02",
    lease_end_date: "2026-12-31",
    target_move_in_date: "2027-01-08",
  });
  assert.deepEqual(ok.structured.warnings, []);
});

test("plan_tenant_transition: rejects impossible dates", () => {
  assert.throws(() => planTenantTransition({ notice_date: "2026-12-31", lease_end_date: "2026-11-01" }), ToolInputError);
  assert.throws(() => planTenantTransition({ notice_date: "2026-02-30", lease_end_date: "2026-11-01" }), ToolInputError);
  assert.throws(
    () => planTenantTransition({ notice_date: "2026-11-05", lease_end_date: "2026-12-01", target_move_in_date: "2026-11-01" }),
    ToolInputError,
  );
});

test("plan_tenant_transition: short notice keeps every date inside the window", () => {
  const { structured } = planTenantTransition({ notice_date: "2026-11-01", lease_end_date: "2026-11-03" });
  const steps = structured.steps as Array<{ date: string }>;
  assert.equal(steps.length, 9);
  for (const s of steps) assert.ok(s.date >= "2026-11-01");
});

test("draft_owner_update: uses only the supplied facts and carries the draft notice", () => {
  const { structured } = draftOwnerUpdate({
    owner_name: "Ms. Calloway",
    property_label: "Linden Flats 4A",
    update_type: "lease_signed",
    facts: "Lease signed on January 4 for a twelve-month term.",
    next_step: "Move-in on January 8.",
    tone: "warm",
  });
  const body = structured.body as string;
  assert.match(body, /^Hello Ms\. Calloway,/);
  assert.match(body, /Lease signed on January 4 for a twelve-month term\./);
  assert.match(body, /Next step: Move-in on January 8\./);
  assert.match(body, /Thank you for your continued trust/);
  assert.equal(structured.subject, "Linden Flats 4A: Lease signed");
  assert.equal(structured.note, DRAFT_NOTICE);
});

test("draft_owner_update: plain tone, no owner name, no next step", () => {
  const { structured } = draftOwnerUpdate({ property_label: "Unit 2", update_type: "general", facts: "A fact." });
  const body = structured.body as string;
  assert.match(body, /^Hello,/);
  assert.doesNotMatch(body, /Next step/);
  assert.match(body, /Please reply with any questions\./);
});

test("get_portfolio_review: verbatim lines and tracked link", () => {
  const { structured } = getPortfolioReview();
  assert.equal(structured.company, COMPANY_LINE);
  assert.equal(
    COMPANY_LINE,
    "DoorStopper is building AI-assisted operating software for property managers and the rental portfolios they run.",
  );
  assert.equal(BOUNDARY_LINE, "Beside your PMS. Your team decides.");
  assert.equal(structured.status, "Available now");
  assert.equal(REVIEW_URL, "https://doorstopper.io/?utm_source=chatgpt&utm_medium=plugin#review");
  assert.equal(structured.url, REVIEW_URL);
});
