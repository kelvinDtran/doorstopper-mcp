import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { createServer as createHttpServer } from "node:http";
import { test } from "node:test";
import { handleMcp } from "../src/handler.js";
import { connect } from "./helpers.js";

const EXPECTED = ["estimate_turnover_cost", "plan_tenant_transition", "draft_owner_update", "get_portfolio_review"];

test("tools/list: exactly the four tools, all three annotations explicit, titles set", async () => {
  const client = await connect();
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), [...EXPECTED].sort());
  for (const t of tools) {
    assert.ok(t.title, `${t.name} title`);
    for (const k of ["readOnlyHint", "destructiveHint", "openWorldHint"] as const) {
      assert.equal(typeof t.annotations?.[k], "boolean", `${t.name} ${k}`);
    }
    assert.equal(t.annotations?.readOnlyHint, true);
    assert.equal(t.annotations?.destructiveHint, false);
    assert.equal(t.annotations?.openWorldHint, t.name === "get_portfolio_review");
  }
});

test("tools/call returns structuredContent and text content, no ids or timestamps", async () => {
  const client = await connect();
  const res = await client.callTool({
    name: "estimate_turnover_cost",
    arguments: { monthly_rent: 1800, vacant_days: 14, make_ready_cost: 900 },
  });
  assert.ok(res.structuredContent && typeof res.structuredContent === "object");
  assert.equal((res.content as Array<{ type: string }>)[0]!.type, "text");
  const json = JSON.stringify(res);
  assert.doesNotMatch(json, /session|trace|timestamp|server_time/i);
});

test("invalid inputs are rejected and bad dates return a tool error", async () => {
  const client = await connect();
  const bad = await client.callTool({ name: "estimate_turnover_cost", arguments: { monthly_rent: -5, vacant_days: 1, make_ready_cost: 1 } }).catch((e) => e);
  assert.ok(bad instanceof Error || bad.isError === true);
  const dates = await client.callTool({
    name: "plan_tenant_transition",
    arguments: { notice_date: "2026-12-31", lease_end_date: "2026-11-01" },
  });
  assert.equal(dates.isError, true);
});

test("HTTP /mcp is stateless: tools/list works with no session id and none is issued", async () => {
  const http = createHttpServer((req, res) => void handleMcp(req, res));
  await new Promise<void>((r) => http.listen(0, r));
  const port = (http.address() as AddressInfo).port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}/mcp`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }),
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("mcp-session-id"), null);
    const body = (await res.json()) as { result: { tools: unknown[] } };
    assert.equal(body.result.tools.length, 4);
    const get = await fetch(`http://127.0.0.1:${port}/mcp`);
    assert.equal(get.status, 405);
  } finally {
    http.close();
  }
});
