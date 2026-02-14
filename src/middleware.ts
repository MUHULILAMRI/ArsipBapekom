import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPaths = ["/dashboard", "/archives", "/admin", "/profile"];
const adminUserPaths = ["/admin/users"];
const adminStoragePaths = ["/admin/storage"];

export async function middleware(req: NextRequest) {
  // Step 1: Clear old oversized session cookies that cause HTTP 431
  const oldCookie = req.cookies.get("next-auth.session-token");
  const oldCookieChunked = req.cookies.getAll().filter(c => c.name.startsWith("next-auth.session-token."));

  if (oldCookie || oldCookieChunked.length > 0) {
    const response = NextResponse.redirect(req.url);
    response.cookies.set("next-auth.session-token", "", { maxAge: 0, path: "/" });
    for (const c of oldCookieChunked) {
      response.cookies.set(c.name, "", { maxAge: 0, path: "/" });
    }
    response.cookies.set("next-auth.csrf-token", "", { maxAge: 0, path: "/" });
    response.cookies.set("next-auth.callback-url", "", { maxAge: 0, path: "/" });
    return response;
  }

  const path = req.nextUrl.pathname;

  // Step 2: Check if this is a protected route
  const isProtected = protectedPaths.some(p => path.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Step 3: Auth check for protected routes
  const token = await getToken({ req, cookieName: "next-auth.session-token-v2" });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Step 4: Role-based access
  if (adminUserPaths.some(p => path.startsWith(p)) && token.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (adminStoragePaths.some(p => path.startsWith(p)) && token.role !== "SUPER_ADMIN" && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
