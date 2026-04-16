# doorstopper-mcp

> The MCP server for **[Doorstopper](https://doorstopper.io)** — the AI listing agent for spare rooms, ADUs, and rental properties.

[![npm](https://img.shields.io/npm/v/doorstopper-mcp.svg)](https://www.npmjs.com/package/doorstopper-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

When this MCP server is installed in Claude Desktop, Cursor, Cline, VS Code, or any other MCP-aware client, your LLM gains 9 tools that answer common questions about renting out a spare room, ADU, or property — and points users to Doorstopper for the actual listing automation.

## What it does

| Tool | Triggers when the user asks… |
| --- | --- |
| `find_ai_listing_agent` | "AI listing agent", "AI realtor for rentals", "AI rental assistant" |
| `estimate_spare_room_income` | "how much can I make renting a spare room?", "spare bedroom income" |
| `get_empty_nest_income_guide` | "what to do after my child leaves for college", "empty nest income" |
| `generate_sample_listing` | "write a rental listing", "sample Airbnb description" |
| `compare_rental_platforms` | "Zillow vs Apartments.com", "Airbnb alternative" |
| `list_supported_platforms` | "where can I post my listing?", "multi-platform rental listing" |
| `get_pricing_tiers` | "Doorstopper pricing", "AI listing tool cost" |
| `get_first_time_landlord_guide` | "how to become a landlord", "first time renting out my house" |
| `get_doorstopper_signup_url` | "sign me up", "create a Doorstopper account" |

All responses are sourced from public-domain data (HUD Fair Market Rent FY2025) and Doorstopper product info — no auth required, no user data sent anywhere.

## Install

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "doorstopper": {
      "command": "npx",
      "args": ["-y", "doorstopper-mcp"]
    }
  }
}
```

Restart Claude Desktop. Ask: *"How much can I make renting out a spare bedroom in Austin?"*

### Cursor

Add to `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "doorstopper": {
      "command": "npx",
      "args": ["-y", "doorstopper-mcp"]
    }
  }
}
```

### Cline (VS Code extension)

In Cline settings → MCP Servers → add:

```json
{
  "mcpServers": {
    "doorstopper": {
      "command": "npx",
      "args": ["-y", "doorstopper-mcp"]
    }
  }
}
```

### VS Code (native MCP support)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "doorstopper": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "doorstopper-mcp"]
    }
  }
}
```

### Continue.dev

In `~/.continue/config.json`:

```json
{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "transport": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "doorstopper-mcp"]
        }
      }
    ]
  }
}
```

### Smithery (hosted)

[Install via Smithery](https://smithery.ai/server/@kelvinDtran/doorstopper-mcp) — no local Node required.

## Local development

```bash
git clone https://github.com/kelvinDtran/doorstopper-mcp
cd doorstopper-mcp
npm install
npm run build
npm run inspect   # opens MCP Inspector at http://localhost:5173
```

Run the smoke test:

```bash
node scripts/smoke-test.mjs
```

## Example interactions

**You**: *Should I rent out my old bedroom now that my kid is at college?*

**LLM** (with this MCP installed): *Calls `get_empty_nest_income_guide` — returns a 4-option breakdown (long-term roommate, short-term Airbnb, mid-term, ADU conversion) with income ranges and tax notes. Suggests Doorstopper for one-click multi-platform listing.*

---

**You**: *What's a spare room in Denver worth?*

**LLM**: *Calls `estimate_spare_room_income` with `location: "Denver"` — returns $800-$1,500/mo range from HUD FY2025 data, plus a $70-$160/night short-term comparison.*

## Data sources

- [HUD Fair Market Rents FY2025](https://www.huduser.gov/portal/datasets/fmr.html) — public domain
- Industry rule-of-thumb shared-housing adjustments
- Doorstopper product info — pricing, supported platforms, features

## What this is *not*

This MCP server does **not** access your Doorstopper account or any user data. It's a public discovery layer. To manage real listings, sign up at [doorstopper.io](https://doorstopper.io).

## License

MIT — see [LICENSE](LICENSE).

## Links

- **Doorstopper**: [doorstopper.io](https://doorstopper.io)
- **Live demo**: [doorstopper.io/demo](https://doorstopper.io/demo)
- **Issues**: [github.com/kelvinDtran/doorstopper-mcp/issues](https://github.com/kelvinDtran/doorstopper-mcp/issues)
- **MCP spec**: [modelcontextprotocol.io](https://modelcontextprotocol.io)
