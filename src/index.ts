#!/usr/bin/env node
/**
 * Doorstopper MCP server — exposes 9 tools to LLMs covering rental-listing
 * questions, spare-room income estimation, empty-nest guides, and pointers to
 * doorstopper.io. Uses stdio transport (standard for local MCP clients).
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "./zod-to-json.js";
import { TOOLS } from "./tools.js";

const server = new Server(
  {
    name: "doorstopper-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: zodToJsonSchema(t.inputSchema),
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }
  try {
    const result = await tool.handler(args ?? {});
    return {
      content: [{ type: "text", text: result }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      content: [{ type: "text", text: `Error invoking ${name}: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr so it doesn't pollute stdio JSON-RPC channel.
  console.error("[doorstopper-mcp] ready — 9 tools registered");
}

main().catch((err) => {
  console.error("[doorstopper-mcp] fatal:", err);
  process.exit(1);
});
