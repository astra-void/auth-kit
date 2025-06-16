import { NextRequest, NextResponse } from "next/server";
import { MiddlewareParams } from "./types";
import { getCookieName } from "./lib/cookie";
import { CSRF_COOKIE_NAME, generateCsrfToken } from "./lib";

const isProduction = typeof process !== 'undefined' &&
                     process.env.NODE_ENV === 'production';

export function AuthKitMiddleware(config: MiddlewareParams) {
    return function middleware(req: NextRequest) {
        const { pathname } = req.nextUrl;
        const {
            alwaysSetToken = false,
            loginPath = '/login',
            logoutPath = '/logout',
            registerPath = '/register',
            protectedRoutes = [],
        } = config;

        const needCsrfToken = alwaysSetToken ||
            pathname === loginPath || 
            pathname === logoutPath ||
            pathname === registerPath ||
            protectedRoutes.some(route => pathname.startsWith(route));

        if (!needCsrfToken) return NextResponse.next();

        const cookieName = getCookieName(CSRF_COOKIE_NAME);
        const existingToken = req.cookies.get(cookieName);
        if (existingToken) {
            return NextResponse.next();
        }

        const token = generateCsrfToken();
        const res = NextResponse.next();
        res.cookies.set(cookieName, token, {
            httpOnly: false,
            sameSite: 'strict',
            secure: isProduction,
            path: '/',
            maxAge: 60 * 15
        });
        
        return res;
    }
}