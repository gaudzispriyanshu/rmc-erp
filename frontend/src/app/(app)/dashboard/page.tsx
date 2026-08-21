import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/feedback/empty-state";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Order → Batch → Dispatch → Deliver → Invoice, at a glance."
      />

      <div className="card-grid">
        {["Open orders", "Trips today", "Volume delivered", "Unbilled amount"].map(
          (label) => (
            <div className="kpi-card" key={label}>
              <span className="kpi-label">{label}</span>
              <span className="kpi-value">—</span>
            </div>
          ),
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Live spine</h2>
        </div>
        <EmptyState
          title="No data wired yet"
          description="Point features/dashboard/hooks at the backend summary endpoint."
        />
      </div>
    </>
  );
}
