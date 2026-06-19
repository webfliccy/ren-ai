import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  if (!isLoginPage) {
    const token = request.cookies.get("admin_token")?.value;
    const secret = process.env.ADMIN_SECRET;
    if (!secret || token !== secret) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
