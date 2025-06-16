import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../core/types";
import { verifyPassword } from "../../auth";
import { signJWT } from "../../jwt";
import { getCookieName } from "../../core/lib/cookie";
import { CSRF_COOKIE_NAME, verifyCsrf } from "../../middleware/lib";

export async function POST(req: NextRequest, config: AuthKitParams) {  
    try {
        const { email, password, redirectTo } = await req.json();

        const headerToken = req.headers.get('X-CSRF-Token');
        const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;

        if (!headerToken || !cookieToken || !verifyCsrf(req)) {
            return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
        };

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
        }

        const user = await config.adapter.getUserByEmail?.(email);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const compare = await verifyPassword(password, user.hashedPassword!);
        if (!compare) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 } );
        }

        const token = await signJWT({
            payload: {
                sub: user.id,
                email: user.email
            },
            secret: process.env.AUTHKIT_SECRET!,
        });

        const res = NextResponse.json({ ok: true, redirectTo: redirectTo ?? '/' });
        res.cookies.set(getCookieName('auth-kit.session-token'), token!, {
            httpOnly: true,
            secure: true,
            path: '/',
            sameSite: 'lax',
            maxAge: 60 * 60,
        });

        return res;
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}