import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_KEY } from "@/lib/auth/constants";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

/**
 * Edge guard (Next 16 "proxy" convention, formerly middleware.ts): keeps unauthenticated users out of the (app) group and signed-in
 * users out of the auth pages. Presence check only — the backend is still the
 * authority on whether the JWT is valid.
 */
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(TOKEN_KEY)?.value);
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!hasToken && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (hasToken && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)"],
};
