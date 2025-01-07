import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/about",
  "/pricing",
  "/customers",
  "/support",
]);

export default clerkMiddleware((auth, request) => {
  if (!auth().userId && !isPublicRoute(request)) {
    auth().redirectToSignIn();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    "/conversations/[id]",
    "/friends",
    "/friends/add-friends",
    "/friends/blocked",
    "/friends/online",
    "/friends/pending",
    "/guild-requests/pending",
    "/guilds/[id]/[channelId]",
  ],
};
