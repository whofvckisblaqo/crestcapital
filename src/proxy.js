// src/proxy.js — Route protection (Next.js 16: "middleware" is now "proxy")
// Runs on every request that matches the config.matcher below

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const MAINTENANCE_BYPASS = ["/admin", "/api/admin", "/api/auth", "/auth", "/_next", "/favicon"];

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;

    // Maintenance mode — block all non-admin routes
    const maintenanceMode = process.env.MAINTENANCE_MODE === "true";
    if (maintenanceMode && !MAINTENANCE_BYPASS.some(p => pathname.startsWith(p))) {
      return NextResponse.json(
        { error: "The platform is currently under maintenance. Please check back soon." },
        { status: 503 }
      );
    }

    // Admin routes require admin role
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/auth/login?error=unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true to allow the proxy function above to run;
      // returning false redirects to the signIn page automatically.
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;
        // Public routes — always allow
        if (
          pathname === "/" ||
          pathname.startsWith("/auth") ||
          pathname.startsWith("/ref") ||
          pathname.startsWith("/about") ||
          pathname.startsWith("/privacy") ||
          pathname.startsWith("/terms") ||
          pathname.startsWith("/security") ||
          pathname.startsWith("/contact") ||
          pathname.startsWith("/fraud-prevention") ||
          pathname.startsWith("/affiliate") ||
          pathname.startsWith("/legal") ||
          pathname.startsWith("/whitepaper") ||
          pathname.startsWith("/company-certificate") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/plans") ||
          pathname.startsWith("/api/admin/seed") ||
          pathname.startsWith("/api/cron") ||
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon")
        ) {
          return true;
        }
        // Everything else requires a valid JWT token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
