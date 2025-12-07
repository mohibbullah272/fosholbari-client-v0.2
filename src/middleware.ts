import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async  function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });


  // Not logged in → redirect

  if (!token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  const pathname = req.nextUrl.pathname;

  // Simple checks (faster than regex)
  const isAdminRoute = pathname.startsWith("/dashboard/admin");
  const isInvestorRoute = pathname.startsWith("/dashboard/investor");

  // Extract the role from cookie header (decoded JWT)
  const role = token.role ;


  // ❌ Admin trying to access investor route
  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // ❌ Investor trying to access admin route
  if (isInvestorRoute && role !== "INVESTOR") {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};