import { NextRequest, NextResponse } from "next/server";
import { CSRF_COOKIE_NAME, verifyCsrf } from "../../middleware/lib";
import { getCookieName } from "../../core/lib/cookie";

export async function POST(req: NextRequest) {
    try {
        const headerToken = req.headers.get('X-CSRF-Token');
        const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;

        if (!headerToken || !cookieToken || !verifyCsrf(req)) {
            return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
        };
        
        const sessionToken = req.cookies.get(getCookieName('auth-kit.session-token'));
        if (!sessionToken) {
            return NextResponse.json({ error: "Session not found" }, { status: 401 });
        }

        const res = NextResponse.json({ message: "Logged out", success: true }, { status: 200 });
        res.cookies.set(getCookieName('auth-kit.session-token'), "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
        });

        return res;
    } catch (error) {
        return NextResponse.json({ error, success: false }, { status: 500 });
    }
}