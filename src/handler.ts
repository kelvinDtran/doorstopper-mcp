import type { IncomingMessage, ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./server.js";

function jsonError(res: ServerResponse, status: number, code: number, message: string): void {
  if (res.headersSent) return;
  res.writeHead(status, { "Content-Type": "application/json", Allow: "POST, OPTIONS" });
  res.end(JSON.stringify({ jsonrpc: "2.0", error: { code, message }, id: null }));
}

/**
 * Stateless Streamable HTTP handler for POST /mcp. A new server and transport are
 * created per request, no session id is issued, and nothing is logged or stored.
 */
export async function handleMcp(req: IncomingMessage, res: ServerResponse, parsedBody?: unknown): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, accept, mcp-protocol-version, mcp-session-id");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Expose-Headers", "mcp-protocol-version");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method !== "POST") {
    jsonError(res, 405, -32000, "Method not allowed. This server is stateless: use POST.");
    return;
  }

  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on("close", () => {
    void transport.close();
    void server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, parsedBody);
  } catch {
    jsonError(res, 500, -32603, "Internal server error.");
  }
}
