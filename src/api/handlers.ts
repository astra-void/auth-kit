import { NextRequest, NextResponse } from "next/server";
import { registerProvider } from "../auth";
import { ConfigParams } from "./types";
import { login } from "./login";
import path from "path";

export * from "./types";

const JWT_SECRET = process.env.JWT_SECRET!;

export function createAuthHandler(params: ConfigParams) {
    const { providers } = params;

    for (const provider of providers) {
        registerProvider(provider.name, provider);
    };

    return async function handler(req: NextRequest) {
        const { pathname } = req.nextUrl;
        const { payload } = await req.json();
        const url = pathname.replace(/^.*\/api\/auth/, "");

        if (req.method === "POST") {
            if (url === "/login") {
                try {
                    const { token, userId } = await login(payload, JWT_SECRET);
                    const response = NextResponse.json({ ok: true, userId }, { status: 200 });
                    response.cookies.set('auth-token', token, {
                        httpOnly: true,
                        path: "/",
                        secure: true,
                        sameSite: "lax",
                    });
                    return response;
                } catch (error) {
                    return NextResponse.json({ ok: false, message: error }, { status: 500 });
                }
            } else if (url === "register") {
                
            }
        }
    }
}