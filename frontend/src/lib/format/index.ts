import { format, formatDistanceToNow, parseISO } from "date-fns";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const decimal = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export const formatCurrency = (value: number | null | undefined) =>
  value == null ? "—" : inr.format(value);

export const formatNumber = (value: number | null | undefined) =>
  value == null ? "—" : decimal.format(value);

/** Concrete volumes are always cubic metres. */
export const formatVolume = (value: number | null | undefined) =>
  value == null ? "—" : `${decimal.format(value)} m³`;

const toDate = (value: string | Date) =>
  typeof value === "string" ? parseISO(value) : value;

export const formatDate = (value: string | Date | null | undefined) =>
  value == null ? "—" : format(toDate(value), "dd MMM yyyy");

export const formatDateTime = (value: string | Date | null | undefined) =>
  value == null ? "—" : format(toDate(value), "dd MMM yyyy, HH:mm");

export const formatRelative = (value: string | Date | null | undefined) =>
  value == null ? "—" : formatDistanceToNow(toDate(value), { addSuffix: true });
