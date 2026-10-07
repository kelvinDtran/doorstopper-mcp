import { z } from "zod";
import type { ToolDef, ToolOutput } from "./types.js";

export const UPDATE_TYPES = [
  "turnover_started",
  "make_ready_progress",
  "listed",
  "application_received",
  "lease_signed",
  "payment_exception",
  "general",
] as const;
export type UpdateType = (typeof UPDATE_TYPES)[number];

const inputSchema = {
  owner_name: z.string().min(1).max(120).optional().describe("Optional. Owner's name for the greeting."),
  property_label: z.string().min(1).max(160).describe("Property or unit label, for example 4A Linden Flats."),
  update_type: z.enum(UPDATE_TYPES).describe("What kind of update this is."),
  facts: z.string().min(1).max(2000).describe("The facts to include, written by you. The draft uses only these."),
  next_step: z.string().min(1).max(500).optional().describe("Optional. The next step and, if you have it, its date."),
  tone: z.enum(["plain", "warm"]).default("plain").describe("Tone of the draft. Defaults to plain."),
};

export const DRAFT_NOTICE = "Draft only. Nothing is sent: you review, edit and send it.";

const LEAD: Record<UpdateType, (p: string) => string> = {
  turnover_started: (p) => `This is an update on ${p}: a turnover has started.`,
  make_ready_progress: (p) => `This is a make-ready progress update on ${p}.`,
  listed: (p) => `This is an update on ${p}: the unit is listed.`,
  application_received: (p) => `This is an update on ${p}: an application has been received.`,
  lease_signed: (p) => `This is an update on ${p}: a lease has been signed.`,
  payment_exception: (p) => `This is a note on a payment exception at ${p}.`,
  general: (p) => `This is an update on ${p}.`,
};

const SUBJECT: Record<UpdateType, string> = {
  turnover_started: "Turnover started",
  make_ready_progress: "Make-ready progress",
  listed: "Unit listed",
  application_received: "Application received",
  lease_signed: "Lease signed",
  payment_exception: "Payment exception",
  general: "Update",
};

export interface OwnerUpdateInput {
  owner_name?: string;
  property_label: string;
  update_type: UpdateType;
  facts: string;
  next_step?: string;
  tone?: "plain" | "warm";
}

export function draftOwnerUpdate(input: OwnerUpdateInput): ToolOutput {
  const tone = input.tone ?? "plain";
  const subject = `${input.property_label}: ${SUBJECT[input.update_type]}`;
  const greeting = input.owner_name ? `Hello ${input.owner_name},` : "Hello,";
  const closing =
    tone === "warm"
      ? "Thank you for your continued trust. Please reach out with any questions."
      : "Please reply with any questions.";
  const parts = [
    greeting,
    LEAD[input.update_type](input.property_label),
    `Details: ${input.facts.trim()}`,
    ...(input.next_step ? [`Next step: ${input.next_step.trim()}`] : []),
    closing,
  ];
  const body = parts.join("\n\n");
  return {
    structured: { subject, body, update_type: input.update_type, tone, note: DRAFT_NOTICE },
    summary: `Draft owner update ready. Subject: ${subject}. ${DRAFT_NOTICE}`,
  };
}

export const draftOwnerUpdateTool: ToolDef = {
  name: "draft_owner_update",
  title: "Draft owner update",
  description:
    "Draft an email update to a property owner from the facts you provide (template-based; it adds no facts of its own). Returns a subject and body. Nothing is sent.",
  inputSchema,
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  handler: draftOwnerUpdate,
};
