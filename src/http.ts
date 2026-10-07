import { createServer as createHttpServer } from "node:http";
import { handleMcp } from "./handler.js";

const port = Number(process.env.PORT ?? 3000);

createHttpServer((req, res) => {
  const path = (req.url ?? "").split("?")[0];
  if (path === "/mcp") {
    void handleMcp(req, res);
    return;
  }
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found. The MCP endpoint is /mcp.");
}).listen(port, () => {
  console.error(`MCP server listening on http://localhost:${port}/mcp`);
});
