import { ToolInputError } from "./types.js";

const MS_PER_DAY = 86_400_000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse YYYY-MM-DD as a UTC calendar date; throws ToolInputError if not a real date. */
export function parseDate(value: string, field: string): Date {
  const m = ISO_DATE.exec(value);
  if (!m) throw new ToolInputError(`${field} must be a date in YYYY-MM-DD format.`);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) {
    throw new ToolInputError(`${field} is not a real calendar date.`);
  }
  return date;
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function diffDays(later: Date, earlier: Date): number {
  return Math.round((later.getTime() - earlier.getTime()) / MS_PER_DAY);
}

/** Clamp date into [min, max]; if min > max, min wins. */
export function clampDate(date: Date, min: Date, max: Date): Date {
  if (date.getTime() > max.getTime()) date = max;
  if (date.getTime() < min.getTime()) date = min;
  return date;
}
