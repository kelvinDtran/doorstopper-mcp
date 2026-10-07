import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { tools } from "./tools/index.js";
import { ToolInputError, errorResult, toCallToolResult } from "./tools/types.js";

export const SERVER_NAME = "DoorStopper";
export const SERVER_VERSION = "0.2.0";

/** Build a fresh server. Stateless: one per request on HTTP, one per process on stdio. */
export function createServer(): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
      },
      async (input: unknown) => {
        try {
          return toCallToolResult(await tool.handler(input));
        } catch (err) {
          if (err instanceof ToolInputError) return errorResult(err.message);
          return errorResult("The tool could not complete this request.");
        }
      },
    );
  }
  return server;
}
