import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../core/types";
import { hashPassword, verifyPassword } from "../../auth";
import { signJWT } from "../../jwt";

export async function POST(req: NextRequest, config: AuthKitParams) {  
    try {
        const { email, password } = await req.json();
        const { adapter, algorithm = 'bcrypt' } = config;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password, algorithm);
        const user = await adapter.createUser?.(email, hashedPassword);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const token = await signJWT({
            payload: {
                sub: user.id,
                email: user.email
            },
            secret: process.env.AUTHKIT_SECRET!,
        });

        const res = NextResponse.json({ ok: true });
        res.cookies.set('auth_token', token!, {
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