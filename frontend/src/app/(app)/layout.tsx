import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

/** Authenticated shell. Route protection happens in src/proxy.ts. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <Topbar />
      <main className="app-shell-main">
        <div className="app-shell-content">{children}</div>
      </main>
    </div>
  );
}
