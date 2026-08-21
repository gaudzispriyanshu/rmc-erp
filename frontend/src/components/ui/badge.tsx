import { cn } from "@/lib/utils/cn";
import { statusTone, type Tone } from "@/types/status";

const TONE: Record<Tone, string> = {
  neutral: "badge-neutral",
  info: "badge-info",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  primary: "badge-primary",
};

export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("badge", TONE[tone], dot && "badge-dot", className)}>
      {children}
    </span>
  );
}

/** Any free-form status string -> the right tone, one place. */
export function StatusBadge({ status }: { status: string | null | undefined }) {
  return (
    <Badge tone={statusTone(status)} dot>
      {status ? status.replace(/_/g, " ") : "unknown"}
    </Badge>
  );
}
