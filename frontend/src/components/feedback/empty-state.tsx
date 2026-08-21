import { Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="empty-state-title">{title}</p>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}
