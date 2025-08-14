import { NextRequest, NextResponse } from "next/server";
import { MiddlewareParams } from "./types";
import { CSRF_COOKIE_NAME, generateCsrfToken } from "./lib";
import { getCookieName } from "../core/lib";
import { verifyJWT } from "../jwt";

export function AuthKitMiddleware(config: MiddlewareParams) {
    return async function middleware(req: NextRequest) {
        const { pathname } = req.nextUrl;
        const {
            alwaysSetToken = false,
            loginPath = '/login',
            logoutPath = '/logout',
            registerPath = '/register',
            protectedRoutes = [],
        } = config;

        const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
        if (isProtected) {
            const sessionToken = req.cookies.get(getCookieName("auth-kit.session-token"))?.value;
            if (!sessionToken) {
                return NextResponse.redirect(req.nextUrl.origin + loginPath);
            }
            
            const session = verifyJWT({ token: sessionToken, secret: process.env.AUTH_KIT_SECRET! });
            if (!session) {
                return NextResponse.redirect(req.nextUrl.origin + loginPath);
            }
        }

        const needCsrfToken = alwaysSetToken ||
            pathname === loginPath || 
            pathname === logoutPath ||
            pathname === registerPath ||
            isProtected;

        if (!needCsrfToken) return NextResponse.next();

        const cookieName = getCookieName(CSRF_COOKIE_NAME);

        const token = await generateCsrfToken();

        const res = NextResponse.next();
        
        res.cookies.delete(cookieName);

        res.cookies.set(cookieName, token, {
            httpOnly: false,
            sameSite: 'strict',
            secure: true,
            path: '/',
            maxAge: 60 * 15
        });
        
        return res;
    }
}