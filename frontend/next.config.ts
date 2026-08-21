import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: import.meta.dirname },
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  typescript: { ignoreBuildErrors: false },

  /**
   * Real 307s for index routes. A server-component `redirect()` on a statically
   * prerendered page ships an HTML shell that redirects client-side instead —
   * fine in a browser, wrong for anything reading status codes.
   */
  async redirects() {
    return [
      { source: "/", destination: "/dashboard", permanent: false },
      { source: "/inventory", destination: "/inventory/items", permanent: false },
      { source: "/settings", destination: "/settings/profile", permanent: false },
    ];
  },
};

export default nextConfig;
