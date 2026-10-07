/** Banned phrases for DoorStopper output (plan section 3, DoorStopper claim rules). Matched case-insensitively. */
export const BANNED_PHRASES = [
  "operating system",
  "system of record",
  "system of action",
  "autopilot",
  "fully automated",
  "AI operator",
  "guarantee",
  "guaranteed",
  "insurance",
  "insurer",
  "underwrite",
  "zero risk",
  "nationwide",
  "works with every",
  "first ",
  "only platform",
  "spare room",
  "spare-room",
  "empty nest",
  "airbnb",
  "landlord",
  "listing agent",
  "protect",
  "pricing",
  "per month",
  "/mo",
  "$",
];

/**
 * Phrases allowed only because the brief requires them verbatim. The company line
 * contains "operating software" (not banned) so nothing is currently exempt;
 * kept explicit so any exemption must be added here, visibly.
 */
export const ALLOWED_VERBATIM: string[] = [];

export function findBanned(text: string, banned: string[] = BANNED_PHRASES): string[] {
  let scrubbed = text.toLowerCase();
  for (const ok of ALLOWED_VERBATIM) scrubbed = scrubbed.split(ok.toLowerCase()).join(" ");
  return banned.filter((p) => scrubbed.includes(p.toLowerCase()));
}
