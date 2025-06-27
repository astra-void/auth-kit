import { NextResponse } from "next/server";
import { getCookieName } from "../../core/lib/cookie";
import { signJWT } from "../../jwt";
import { AdapterUser } from "../../adapters";

export async function generateJWT(user: AdapterUser): Promise<NextResponse> {
    const token = await signJWT({
        payload: {
            sub: user.id,
            email: user.email
        },
        secret: process.env.AUTHKIT_SECRET!,
    });

    const res = NextResponse.json({ success: true });
    res.cookies.set(getCookieName('auth-kit.session-token'), token!, {
        httpOnly: true,
        secure: true,
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60,
    });

    return res;
}