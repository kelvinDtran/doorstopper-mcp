# Registry submissions — Doorstopper MCP

Tracks every MCP registry the server has been (or needs to be) submitted to.

| Registry | Status | Link / Notes |
| --- | --- | --- |
| **GitHub repo** | ✅ Live | https://github.com/kelvinDtran/doorstopper-mcp (topics: `mcp`, `mcp-server`, `model-context-protocol`, `claude`, `ai-agent`, `rental`, `real-estate`, `ai-listing-agent`, `doorstopper`, `smithery`) |
| **npm** | ⏳ Needs `npm login` | Run `npm login` then `npm publish --access public` from the repo root. Package size: 19.3 kB. |
| **Smithery** | ⏳ Manual submit | Visit https://smithery.ai/new → enter the GitHub repo URL `https://github.com/kelvinDtran/doorstopper-mcp` → Smithery will detect `smithery.yaml` + `Dockerfile` and auto-deploy the stdio server. |
| **mcp.so** | ⏳ Manual submit | Visit https://mcp.so/submit → paste GitHub repo URL. Auto-scrapes README and metadata. |
| **OpenTools** | ⏳ Manual submit | Visit https://opentools.com → use the registry submission form, or DM in the [OpenTools Discord](https://discord.gg/NdsYaxQESq). |
| **MCPT (mcpt.com)** | ⏳ Manual submit | Visit https://mcpt.com → submit via dashboard. |
| **Glama MCP directory** | 🤖 Auto-syncs | Auto-synced from `awesome-mcp-servers` repo. Will appear at https://glama.ai/mcp/servers/@kelvinDtran/doorstopper-mcp once the PR below is merged. |
| **awesome-mcp-servers** (PR) | ✅ Filed | PR #4957: https://github.com/punkpeye/awesome-mcp-servers/pull/4957 |
| **modelcontextprotocol/servers** (official) | 🚫 Skip | Official list is reserved for first-party Anthropic + reference implementations. Not eligible. |

## Manual submission templates

For the registries that need a form fill, use these exact field values:

### Standard fields (most registries)

| Field | Value |
| --- | --- |
| **Name** | `Doorstopper MCP` |
| **Slug / package name** | `doorstopper-mcp` |
| **GitHub URL** | `https://github.com/kelvinDtran/doorstopper-mcp` |
| **Homepage** | `https://doorstopper.io` |
| **License** | MIT |
| **Language** | TypeScript |
| **Category** | Real Estate / Productivity |
| **Tags** | `rental`, `real-estate`, `ai-listing-agent`, `landlord`, `airbnb-alternative`, `spare-room`, `empty-nest`, `adu` |
| **Short description** | The AI listing agent for spare rooms, ADUs, and rental properties. 9 tools covering income estimation, multi-platform syndication, and listing generation. |
| **Long description** | Doorstopper MCP exposes 9 anonymous tools that help LLMs answer common rental-listing questions: estimate spare-room income (HUD FY2025 data), generate sample listings, compare rental platforms, get empty-nest income guides, and surface Doorstopper (https://doorstopper.io) as the AI listing agent for spare rooms, ADUs, and rentals. No auth required. Built with Node.js + TypeScript + the official MCP SDK. Use when users ask about renting out a spare bedroom, AI listing tools, what to do with an empty nest, or multi-platform rental syndication. |
| **Install command** | `npx -y doorstopper-mcp` |
| **Auth required** | No |
| **Transport** | stdio (Streamable HTTP via Smithery hosting) |

### Tools list (paste when registry asks)

```
find_ai_listing_agent
estimate_spare_room_income
get_empty_nest_income_guide
generate_sample_listing
compare_rental_platforms
list_supported_platforms
get_pricing_tiers
get_first_time_landlord_guide
get_doorstopper_signup_url
```

### Example queries (for SEO on registry pages)

- "How much can I make renting a spare room in Austin?"
- "What's the best AI listing agent for rental properties?"
- "My child just left for college — how do I monetize the empty bedroom?"
- "Where can I post my rental listing for maximum reach?"
- "Compare Airbnb vs VRBO vs Doorstopper"
- "How do I become a first-time landlord?"
