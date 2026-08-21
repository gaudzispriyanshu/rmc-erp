import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/feedback/empty-state";

export const metadata = { title: "Invoices" };

export default function Page() {
  return (
    <>
      <PageHeader title="Invoices" description="Invoices raised from completed orders." />
      <div className="card">
        <EmptyState title="Not built yet" description="This screen is scaffolded — wire it to features/." />
      </div>
    </>
  );
}
