import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/feedback/empty-state";

export const metadata = { title: "Mix designs" };

export default function Page() {
  return (
    <>
      <PageHeader title="Mix designs" description="Approved concrete grades and recipes." />
      <div className="card">
        <EmptyState title="Not built yet" description="This screen is scaffolded — wire it to features/." />
      </div>
    </>
  );
}
