import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/feedback/empty-state";

export const metadata = { title: "New order" };

export default function Page() {
  return (
    <>
      <PageHeader title="New order" description="Create an order for a customer and mix design." />
      <div className="card">
        <EmptyState title="Not built yet" description="This screen is scaffolded — wire it to features/." />
      </div>
    </>
  );
}
