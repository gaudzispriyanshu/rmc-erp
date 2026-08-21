import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/feedback/empty-state";

export const metadata = { title: "New trip" };

export default function Page() {
  return (
    <>
      <PageHeader title="New trip" description="Assign a vehicle and driver to an order." />
      <div className="card">
        <EmptyState title="Not built yet" description="This screen is scaffolded — wire it to features/." />
      </div>
    </>
  );
}
