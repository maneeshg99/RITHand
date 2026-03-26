import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // This middleware refreshes the auth session on every request
  try {
    const { response, user } = await updateSession(request);

    const pathname = request.nextUrl.pathname;

    // If user is NOT authenticated
    if (!user) {
      // Redirect to login if trying to access protected routes
      if (pathname.startsWith("/app") || pathname === "/onboarding") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    // If user IS authenticated
    if (user) {
      // Redirect to /app if trying to access auth pages
      if (pathname === "/login" || pathname === "/signup") {
        return NextResponse.redirect(new URL("/app", request.url));
      }
    }

    return response;
  } catch (error) {
    // If there was an error updating the session, continue anyway
    // The actual auth check will happen in the route handlers
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
