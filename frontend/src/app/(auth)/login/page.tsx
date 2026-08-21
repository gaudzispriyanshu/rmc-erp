import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form/form-field";

export const metadata = { title: "Sign in" };

/**
 * Markup only — no submit logic yet. The real version becomes a client
 * component using react-hook-form + zod + features/auth/hooks/use-login.
 */
export default function LoginPage() {
  return (
    <div className="auth-card">
      <PageHeader title="Sign in" description="RMC ERP operations console." />

      <div className="form mt-6">
        <FormField label="Email" htmlFor="email" required>
          <Input id="email" name="email" type="email" autoComplete="email" />
        </FormField>

        <FormField label="Password" htmlFor="password" required>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
          />
        </FormField>

        <Button type="submit" block>
          Sign in
        </Button>
      </div>
    </div>
  );
}
