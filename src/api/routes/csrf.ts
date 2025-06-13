import { NextRequest, NextResponse } from "next/server";
import { CSRF_COOKIE_NAME, generateCsrfToken } from "../../core";
import { getCookieName } from "../../jwt/utils";

export async function GET(req: NextRequest) {
    const token = generateCsrfToken();

    const res = NextResponse.json({ csrfToken: token });
    res.cookies.set(getCookieName(CSRF_COOKIE_NAME), token, {
        httpOnly: false,
        sameSite: 'strict',
        secure: true,
        path: '/',
    });

    return res;
}