import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

    // Only ADMIN may enter /admin/* — others are bounced to the board.
    if (isAdminRoute && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/board", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      // Any valid session may pass; unauthenticated → redirected to /login.
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  },
);

export const config = {
  matcher: ["/board/:path*", "/admin/:path*"],
};
