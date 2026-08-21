import { cn } from "@/lib/utils/cn";

export function FormField({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  fullWidth = false,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("form-field", fullWidth && "form-row-full")}>
      <label className={cn("label", required && "label-required")} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="field-error">{error}</p>
      ) : hint ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
}
