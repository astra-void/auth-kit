import { NextResponse } from "next/server";
import { getCookieName } from "../../core/lib/cookie";
import { signJWT } from "../../jwt";
import { AdapterUser } from "../../adapters";

export async function generateJWT(user: AdapterUser, redirect?: boolean): Promise<NextResponse> {
    const token = await signJWT({
        payload: {
            sub: user.id,
            email: user.email,
            role: user.role ?? null
        },
        secret: process.env.AUTHKIT_SECRET!,
    });

    const publicUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };

    if (redirect) {
        const res = NextResponse.redirect(process.env.AUTHKIT_ORIGIN!);
        res.cookies.set(getCookieName('auth-kit.session-token'), token!, {
            httpOnly: true,
            secure: true,
            path: '/',
            sameSite: 'lax',
            maxAge: 60 * 60,
        });

        return res;
    }

    const res = NextResponse.json({ success: true, user: publicUser });
    res.cookies.set(getCookieName('auth-kit.session-token'), token!, {
        httpOnly: true,
        secure: true,
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60,
    });

    return res;
}