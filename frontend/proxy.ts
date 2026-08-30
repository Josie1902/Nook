import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth/init";


const protectedRoutes = [
    "/",
];

const publicRoutes = [
    "/",
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
];

// Notes on proxy: https://dev.to/iurii_rogulia/nextjs-16-proxyts-migration-from-middlewarets-28km
// Official Doc: https://nextjs.org/docs/pages/guides/authentication#creating-a-data-access-layer-dal

export async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;  

    const isProtectedRoute = protectedRoutes.some(
      (route) =>
        path === route ||
        path.startsWith(`${route}/`)
    );  

    const isPublicRoute = publicRoutes.some(
      (route) =>
        path === route ||
        path.startsWith(`${route}/`)
    );  

    /*
     * Ask Better Auth for the current session.
     *
     * We forward the incoming request headers so
     * Better Auth can read its session cookie.
     */
    const session = await auth.api.getSession({
        headers: req.headers,
    }); 

    const isAuthenticated = !!session?.user;    

    /*
     * Protected route + not authenticated
     *
     * /
     *      ↓
     * /signin
     */
    if (isProtectedRoute && !isAuthenticated) {
        const signinUrl = new URL("/signin", req.url);    

        // Remember where the user originally wanted to go.
        signinUrl.searchParams.set(
            "callbackUrl",
            path
        );    
        return NextResponse.redirect(signinUrl);
    }   
    /*
     * Authenticated user trying to access
     * signin/signup.
     *
     * Send them to dashboard instead.
     */
    const isAuthPage =
        path === "/signin" ||
        path === "/signup";   
    if (isAuthPage && isAuthenticated) {
        return NextResponse.redirect(
          new URL("/", req.url)
        );
    }   
    /*
     * Public pages are allowed.
     */
    if (isPublicRoute) {
        return NextResponse.next();
    }   
    return NextResponse.next();
}

export const config = {
    matcher: [
      "/((?!api|_next/static|_next/image|.*\\.png$).*)",
    ],
};