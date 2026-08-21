/**
 * Statuses are free-form strings in the DB by design (no lookup tables).
 * This maps a status value to a badge tone so the class stays domain-blind.
 */
export type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "primary";

const TONES: Record<string, Tone> = {
  pending: "warning",
  open: "warning",
  confirmed: "info",
  scheduled: "info",
  assigned: "info",
  in_progress: "primary",
  in_transit: "primary",
  dispatched: "primary",
  delivered: "success",
  completed: "success",
  closed: "neutral",
  active: "success",
  available: "success",
  approved: "success",
  paid: "success",
  cancelled: "danger",
  rejected: "danger",
  failed: "danger",
  inactive: "neutral",
};

export function statusTone(status: string | null | undefined): Tone {
  if (!status) return "neutral";
  return TONES[status.toLowerCase().replace(/[\s-]/g, "_")] ?? "neutral";
}
