# doorstopper-mcp

MCP server for **[DoorStopper](https://doorstopper.io)**: practical tools for property managers, usable from ChatGPT and Claude.

DoorStopper is building AI-assisted operating software for property managers and the rental portfolios they run. Beside your PMS. Your team decides.

## What it does

Three tools do real work from the numbers and facts you give them, with no sign-up. One tool points to the free portfolio review.

| Tool | What it does | Read-only | Open-world |
| --- | --- | --- | --- |
| `estimate_turnover_cost` | Adds up lost rent, make-ready, leasing and marketing costs and concessions for one turn; optionally annualizes across a portfolio. Arithmetic on your inputs only. | yes | no |
| `plan_tenant_transition` | Builds a dated checklist from notice to the next lease and move-in. Leasing acts are marked as decided by your licensed team. Warns on overlap or a long gap. | yes | no |
| `draft_owner_update` | Drafts an owner update from the facts you provide. Nothing is sent. | yes | no |
| `get_portfolio_review` | Describes the free portfolio review and returns the link to request it. | yes | yes |

Every tool sets `readOnlyHint`, `destructiveHint` and `openWorldHint` explicitly, and returns both `structuredContent` and a short text summary.

DoorStopper does not perform leasing acts or decide applications.

## Local development

```bash
npm install
npm run dev          # Streamable HTTP server on http://localhost:3000/mcp
npx @modelcontextprotocol/inspector   # choose Streamable HTTP, URL http://localhost:3000/mcp
npm test             # unit tests and the claims test
npm run build        # type-check and compile
```

`npm start` runs the stdio entry (`dist/stdio.js`) for local clients such as Claude Desktop:

```json
{ "mcpServers": { "doorstopper": { "command": "npx", "args": ["-y", "doorstopper-mcp"] } } }
```

## Hosting

The server is stateless Streamable HTTP at `/mcp`. `api/mcp.ts` is a Vercel Node function and `vercel.json` rewrites `/mcp` to it. No environment variables or secrets are needed.

## Connecting

- **ChatGPT:** in developer mode, add a connector pointing at the hosted `/mcp` URL.
- **Claude:** add the hosted `/mcp` URL as a custom connector (Streamable HTTP).

## Privacy

This server collects no personal data; it does not store tool inputs.

## Claims test

`test/claims.test.ts` calls every tool with representative inputs and fails if any output contains a phrase from the DoorStopper banned-claims list. A negative-control test proves the checker catches an injected phrase.

## License

MIT
