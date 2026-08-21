import { cn } from "@/lib/utils/cn";

export type InputProps = React.ComponentPropsWithoutRef<"input"> & {
  invalid?: boolean;
  numeric?: boolean;
};

export function Input({ invalid, numeric, className, ...props }: InputProps) {
  return (
    <input
      className={cn("input", numeric && "input-numeric", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
