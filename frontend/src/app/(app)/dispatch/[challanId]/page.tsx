import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/feedback/empty-state";

export const metadata = { title: "Challan" };

/** Next 16: route params arrive as a promise. */
export default async function Page({
  params,
}: {
  params: Promise<{ challanId: string }>;
}) {
  const { challanId } = await params;

  return (
    <>
      <PageHeader title={`Challan #${challanId}`} />
      <div className="card">
        <EmptyState title="Not built yet" description="This screen is scaffolded — wire it to features/." />
      </div>
    </>
  );
}
