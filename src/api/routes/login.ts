import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../core/types";
import { signJWT } from "../../jwt";
import { getCookieName } from "../../core/lib/cookie";
import { verifyCsrf } from "../../middleware/lib";
import { errorResponse } from "../lib";
import { AdapterUser } from "../../adapters";

export async function POST(req: NextRequest, config: AuthKitParams) {  
    try {
        const { provider } = await req.json();

        if (!verifyCsrf(req)) {
            return errorResponse("Invalid CSRF token", 403);
        };

        const selectedProvider = config.providers.find(p => p.name === provider);
        if (!selectedProvider) {
            return errorResponse("Unknown provider", 400);
        }

        let user: AdapterUser | null = null;
        try {
            user = await selectedProvider.authorize(req);
        } catch { /* empty */ }
        if (!user) {
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