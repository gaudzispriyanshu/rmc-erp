import Link from "next/link";
import { site } from "@/config/site";

export default function NotFound() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="page-title">Page not found</h1>
        <p className="page-description">That route does not exist.</p>
        <Link href={site.routes.home} className="btn btn-secondary mt-5">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
