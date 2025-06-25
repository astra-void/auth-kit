import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../core/types";
import { verifyPassword } from "../../auth";
import { signJWT } from "../../jwt";
import { getCookieName } from "../../core/lib/cookie";
import { verifyCsrf } from "../../middleware/lib";
import { errorResponse } from "../lib";

export async function POST(req: NextRequest, config: AuthKitParams) {  
    try {
        const { email, password } = await req.json();

        if (!verifyCsrf(req)) {
            return errorResponse("Invalid CSRF token", 403);
        };

        if (!email || !password) {
            return errorResponse("Invalid request", 400)
        }

        const user = await config.adapter.getUserByEmail?.(email);
        if (!user) {
            return errorResponse("Invalid credentials", 401);
        }

        const compare = await verifyPassword(password, user.hashedPassword!);
        if (!compare) {
            return errorResponse("Invalid credentials", 401);
        }

        const token = await signJWT({
            payload: {
                sub: user.id,
                email: user.email
            },
            secret: process.env.AUTHKIT_SECRET!,
        });
        const res = NextResponse.json({ ok: true });
        res.cookies.set(getCookieName('auth-kit.session-token'), token!, {
            httpOnly: true,
            secure: true,
            path: '/',
            sameSite: 'lax',
            maxAge: 60 * 60,
        });

        return res;
    } catch (error) {
        console.error("[AUTH-KIT-ERROR]", error);
        return errorResponse();
    }
}