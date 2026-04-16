import { z, ZodTypeAny } from "zod";

/**
 * Minimal Zod-to-JSON-Schema converter sized to the shapes used by this MCP
 * server (objects, strings, numbers, enums, arrays, optionals, defaults).
 * Avoids pulling in a full library for ~9 tool schemas.
 */
export function zodToJsonSchema(schema: ZodTypeAny): Record<string, unknown> {
  return convert(schema);
}

function convert(s: ZodTypeAny): Record<string, unknown> {
  const def = (s as unknown as { _def: { typeName: string; [key: string]: unknown } })._def;
  const description = (s as { description?: string }).description;

  switch (def.typeName) {
    case "ZodObject": {
      const shape = (def as unknown as { shape: () => Record<string, ZodTypeAny> }).shape();
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      for (const [key, child] of Object.entries(shape)) {
        properties[key] = convert(child);
        if (!isOptional(child)) required.push(key);
      }
      const out: Record<string, unknown> = {
        type: "object",
        properties,
      };
      if (required.length) out.required = required;
      if (description) out.description = description;
      return out;
    }
    case "ZodString":
      return withDesc({ type: "string" }, description);
    case "ZodNumber":
      return withDesc({ type: "number" }, description);
    case "ZodBoolean":
      return withDesc({ type: "boolean" }, description);
    case "ZodArray": {
      const inner = (def as unknown as { type: ZodTypeAny }).type;
      return withDesc({ type: "array", items: convert(inner) }, description);
    }
    case "ZodEnum": {
      const values = (def as unknown as { values: string[] }).values;
      return withDesc({ type: "string", enum: values }, description);
    }
    case "ZodOptional":
    case "ZodDefault": {
      const inner = (def as unknown as { innerType: ZodTypeAny }).innerType;
      const result = convert(inner);
      if (def.typeName === "ZodDefault") {
        const defaultFn = (def as unknown as { defaultValue: () => unknown }).defaultValue;
        result.default = defaultFn();
      }
      if (description) (result as Record<string, unknown>).description = description;
      return result;
    }
    case "ZodNullable": {
      const inner = (def as unknown as { innerType: ZodTypeAny }).innerType;
      const result = convert(inner);
      const types = Array.isArray(result.type) ? result.type : [result.type];
      result.type = [...types, "null"];
      return result;
    }
    default:
      return withDesc({}, description);
  }
}

function isOptional(s: ZodTypeAny): boolean {
  const def = (s as unknown as { _def: { typeName: string } })._def;
  return def.typeName === "ZodOptional" || def.typeName === "ZodDefault";
}

function withDesc(obj: Record<string, unknown>, description?: string): Record<string, unknown> {
  if (description) obj.description = description;
  return obj;
}

// Re-export z so callers don't need a second import line.
export { z };
