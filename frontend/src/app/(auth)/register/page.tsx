import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/feedback/empty-state";

export const metadata = { title: "Create account" };

export default function Page() {
  return (
    <>
      <PageHeader title="Create account" description="Register a new user." />
      <div className="card">
        <EmptyState title="Not built yet" description="This screen is scaffolded — wire it to features/." />
      </div>
    </>
  );
}
