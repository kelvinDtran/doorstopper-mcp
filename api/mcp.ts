import type { IncomingMessage, ServerResponse } from "node:http";
import { handleMcp } from "../src/handler.js";

// Vercel Node function. vercel.json rewrites /mcp to /api/mcp.
export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
): Promise<void> {
  await handleMcp(req, res, req.body);
}
