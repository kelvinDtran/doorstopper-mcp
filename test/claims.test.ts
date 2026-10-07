import assert from "node:assert/strict";
import { test } from "node:test";
import { BANNED_PHRASES, findBanned } from "./claim-check.js";
import { connect } from "./helpers.js";

const CASES: Array<{ name: string; args: Record<string, unknown> }> = [
  { name: "estimate_turnover_cost", args: { monthly_rent: 1850, vacant_days: 21, make_ready_cost: 1400 } },
  {
    name: "estimate_turnover_cost",
    args: {
      monthly_rent: 2400,
      vacant_days: 35,
      make_ready_cost: 2200,
      leasing_and_marketing_cost: 300,
      concessions: 250,
      turns_per_year_across_portfolio: 40,
    },
  },
  {
    name: "plan_tenant_transition",
    args: { notice_date: "2026-11-02", lease_end_date: "2026-12-31", unit_label: "4A Linden Flats" },
  },
  {
    name: "plan_tenant_transition",
    args: { notice_date: "2026-11-02", lease_end_date: "2026-12-31", target_move_in_date: "2027-01-03", make_ready_days: 10 },
  },
  {
    name: "plan_tenant_transition",
    args: { notice_date: "2026-11-02", lease_end_date: "2026-12-31", target_move_in_date: "2027-03-15" },
  },
  ...(["turnover_started", "make_ready_progress", "listed", "application_received", "lease_signed", "payment_exception", "general"] as const).flatMap(
    (update_type) => [
      {
        name: "draft_owner_update",
        args: { owner_name: "Ms. Calloway", property_label: "Linden Flats 4A", update_type, facts: "The tenant gave notice on November 2. The lease ends December 31.", next_step: "Move-out inspection on December 31." },
      },
      {
        name: "draft_owner_update",
        args: { property_label: "Linden Flats 4A", update_type, facts: "Paint and flooring are done.", tone: "warm" },
      },
    ],
  ),
  { name: "get_portfolio_review", args: {} },
];

test("no tool output, title or description contains a banned phrase", async () => {
  const client = await connect();
  const { tools } = await client.listTools();
  for (const t of tools) {
    const hits = findBanned(`${t.name} ${t.title ?? ""} ${t.description ?? ""}`);
    assert.deepEqual(hits, [], `tool metadata for ${t.name} contains banned phrase(s): ${hits.join(", ")}`);
  }
  for (const c of CASES) {
    const res = await client.callTool({ name: c.name, arguments: c.args });
    assert.notEqual(res.isError, true, `${c.name} returned an error for ${JSON.stringify(c.args)}`);
    const content = res.content as Array<{ type: string; text?: string }>;
    const text = content.map((p) => p.text ?? "").join("\n") + "\n" + JSON.stringify(res.structuredContent);
    const hits = findBanned(text);
    assert.deepEqual(hits, [], `${c.name} ${JSON.stringify(c.args)} contains banned phrase(s): ${hits.join(", ")}`);
  }
});

test("every tool name in the case set exists, and every tool is covered", async () => {
  const client = await connect();
  const { tools } = await client.listTools();
  const names = new Set(tools.map((t) => t.name));
  for (const c of CASES) assert.ok(names.has(c.name), `unknown tool ${c.name}`);
  for (const n of names) assert.ok(CASES.some((c) => c.name === n), `tool ${n} has no claims case`);
});

test("negative control: the checker catches an injected banned phrase", () => {
  for (const phrase of BANNED_PHRASES) {
    const text = `Some output text ${phrase.toUpperCase()} more text`;
    assert.ok(findBanned(text).includes(phrase), `checker missed banned phrase: ${JSON.stringify(phrase)}`);
  }
  assert.deepEqual(findBanned("Illustrative arithmetic from the numbers you entered."), []);
});

test("negative control: injecting a banned phrase into real tool output is detected", async () => {
  const client = await connect();
  const res = await client.callTool({
    name: "draft_owner_update",
    arguments: { property_label: "Linden Flats 4A", update_type: "general", facts: "This is a fully automated autopilot." },
  });
  const content = res.content as Array<{ text?: string }>;
  const text = content.map((p) => p.text ?? "").join("\n") + JSON.stringify(res.structuredContent);
  const hits = findBanned(text);
  assert.ok(hits.includes("fully automated") && hits.includes("autopilot"), `expected detection, got ${hits}`);
});
