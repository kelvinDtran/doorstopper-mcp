// Spawns the MCP server over stdio and exercises ListTools + CallTool RPCs.
// No external deps — just child_process + JSON-RPC over stdio.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, "..", "dist", "index.js");

const server = spawn("node", [serverPath], {
  stdio: ["pipe", "pipe", "pipe"],
});

let stderr = "";
server.stderr.on("data", (d) => (stderr += d.toString()));

let buffer = "";
const responses = new Map();
server.stdout.on("data", (chunk) => {
  buffer += chunk.toString();
  let idx;
  while ((idx = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, idx).trim();
    buffer = buffer.slice(idx + 1);
    if (!line) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id != null) {
        const resolver = responses.get(msg.id);
        if (resolver) {
          resolver(msg);
          responses.delete(msg.id);
        }
      }
    } catch {
      // ignore non-JSON lines
    }
  }
});

let nextId = 1;
function send(method, params) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    responses.set(id, resolve);
    const req = JSON.stringify({ jsonrpc: "2.0", id, method, params });
    server.stdin.write(req + "\n");
    setTimeout(() => {
      if (responses.has(id)) {
        responses.delete(id);
        reject(new Error(`Timeout waiting for ${method}`));
      }
    }, 5000);
  });
}

async function run() {
  // 1. Initialize handshake
  await send("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "smoke-test", version: "0.1.0" },
  });
  server.stdin.write(
    JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n",
  );

  // 2. List tools
  const list = await send("tools/list", {});
  const tools = list.result.tools;
  console.log(`✓ Server registered ${tools.length} tools:`);
  for (const t of tools) console.log(`   - ${t.name}`);

  // 3. Call each tool with reasonable args
  const calls = [
    ["find_ai_listing_agent", {}],
    ["estimate_spare_room_income", { location: "Austin", room_type: "spare_bedroom" }],
    ["estimate_spare_room_income", { location: "San Francisco", room_type: "short_term" }],
    ["get_empty_nest_income_guide", {}],
    [
      "generate_sample_listing",
      {
        property_type: "spare_bedroom",
        location: "Brooklyn, NY",
        rent: 1400,
        highlights: ["private bath", "walk to subway", "natural light"],
      },
    ],
    ["compare_rental_platforms", { rental_type: "spare_room" }],
    ["list_supported_platforms", {}],
    ["get_pricing_tiers", {}],
    ["get_first_time_landlord_guide", {}],
    ["get_doorstopper_signup_url", { utm_source: "claude_desktop" }],
  ];

  let pass = 0;
  for (const [name, args] of calls) {
    const res = await send("tools/call", { name, arguments: args });
    const text = res.result?.content?.[0]?.text ?? "";
    const ok = text.length > 100 && text.includes("doorstopper.io");
    console.log(
      `${ok ? "✓" : "✗"} ${name} → ${text.length} chars` + (ok ? "" : `\n${text.slice(0, 200)}`),
    );
    if (ok) pass++;
  }

  console.log(`\n${pass}/${calls.length} tools returned valid responses`);
  if (pass !== calls.length) process.exitCode = 1;
}

run()
  .catch((err) => {
    console.error("FAIL:", err.message);
    console.error("stderr:", stderr);
    process.exitCode = 1;
  })
  .finally(() => server.kill());
