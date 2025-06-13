import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";

export const CSRF_COOKIE_NAME = "authkit-csrf_token";
const MAX_AGE = 1000 * 60 * 10;

export function generateCsrfToken(): string {
    const token = randomBytes(32).toString('hex');
    const timestamp = Date.now();
    const hmac = createHmac('sha256', process.env.AUTHKIT_SECRET!)
        .update(`${token}:${timestamp}`)
        .digest('hex');

    const fullToken = `${token}:${timestamp}:${hmac}`
    return fullToken;
}

export function verifyCsrf(req: NextRequest): boolean {
    const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;
    const headerToken = req.headers.get('X-CSRF-Token');
    if (!cookieToken || !headerToken) return false;

    const [rawToken, timestamp, hmac] = cookieToken.split(':');
    if (!rawToken || !timestamp || !hmac) return false;

    const now = Date.now();
    const age = now - Number(timestamp);

    if (age > MAX_AGE) return false;

    const expectedHmac = createHmac('sha256', process.env.AUTHKIT_SECRET!)
        .update(`${rawToken}:${timestamp}`)
        .digest('hex')

    const hmacBuf = Buffer.from(hmac, 'hex');
    const expectedBuf = Buffer.from(expectedHmac, 'hex');
    if (hmacBuf.length !== expectedBuf.length) return false;

    return timingSafeEqual(hmacBuf, expectedBuf);
}