import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/feedback/empty-state";

export const metadata = { title: "Mix design" };

/** Next 16: route params arrive as a promise. */
export default async function Page({
  params,
}: {
  params: Promise<{ mixDesignId: string }>;
}) {
  const { mixDesignId } = await params;

  return (
    <>
      <PageHeader title={`Mix design #${mixDesignId}`} />
      <div className="card">
        <EmptyState title="Not built yet" description="This screen is scaffolded — wire it to features/." />
      </div>
    </>
  );
}
