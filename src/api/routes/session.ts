import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../core/types";
import { verifyJWT } from "../../jwt";
import { getCookieName } from "../../core/lib/cookie";

export async function GET(req: NextRequest, config: AuthKitParams) {
    try {
        const { adapter } = config;
        const token = req.cookies.get(getCookieName('auth-kit.session-token'))?.value;
        const secret = process.env.AUTHKIT_SECRET;

        if (!token || !secret) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        const payload = await verifyJWT({ token, secret });
        if (!payload?.sub || !payload?.email || typeof payload?.email !== 'string') {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        const user = await adapter.getUserByEmail?.(payload.email);
        if (!user) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        return NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 200 });
    } catch {
        return NextResponse.json({ user: null }, { status: 200 });
    }
}