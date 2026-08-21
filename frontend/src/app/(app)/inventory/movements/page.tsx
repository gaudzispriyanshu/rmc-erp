import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/feedback/empty-state";

export const metadata = { title: "Stock movements" };

export default function Page() {
  return (
    <>
      <PageHeader title="Stock movements" description="Receipts and consumption per batch." />
      <div className="card">
        <EmptyState title="Not built yet" description="This screen is scaffolded — wire it to features/." />
      </div>
    </>
  );
}
