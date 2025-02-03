import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: ["/"],
  ignoredRoutes: [
    "/(sign-in|sign-up|login|signup)(.*)", 
    "/api/webhook/clerk"
  ],
});

export const config = {
  matcher: [
    "/((?!_next|_static|favicon.ico).*)",
    "/(api|trpc)(.*)",
  ],
}; 