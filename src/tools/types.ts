import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { z } from "zod";

/** Raised by a tool when the inputs are individually valid but jointly unusable. */
export class ToolInputError extends Error {}

export interface ToolOutput {
  /** Typed object returned as structuredContent. */
  structured: Record<string, unknown>;
  /** Short plain-text summary returned as content. */
  summary: string;
}

export interface ToolAnnotations {
  readOnlyHint: boolean;
  destructiveHint: boolean;
  openWorldHint: boolean;
}

export interface ToolDef {
  name: string;
  title: string;
  description: string;
  inputSchema: z.ZodRawShape;
  annotations: ToolAnnotations;
  // The handler receives input already parsed by the schema above.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (input: any) => ToolOutput | Promise<ToolOutput>;
}

export function toCallToolResult(out: ToolOutput): CallToolResult {
  return {
    content: [{ type: "text", text: out.summary }],
    structuredContent: out.structured,
  };
}

export function errorResult(message: string): CallToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}
