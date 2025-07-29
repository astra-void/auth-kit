import { hmac } from '@noble/hashes/hmac';
import { sha256 } from "@noble/hashes/sha2";
import { NextRequest } from 'next/server';
import { getCookieName } from './cookie';

function toHex(buffer: Uint8Array) {
  return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
}

const secret = new TextEncoder().encode(process.env.AUTHKIT_SECRET!);

export const CSRF_COOKIE_NAME = "auth-kit.csrf-token";

export function generateCsrfToken() {
    const tokenArray = crypto.getRandomValues(new Uint8Array(32));
    const token = toHex(tokenArray);
    const timestamp = Date.now();
    const data = new TextEncoder().encode(`${token}:${timestamp}`);

    const hmacDigest = hmac(sha256, secret, data);
    const hmacHex = toHex(hmacDigest);

    return `${token}:${timestamp}:${hmacHex}`;
}

export function verifyCsrf(req: NextRequest): boolean {
    const cookieToken = req.cookies.get(getCookieName(CSRF_COOKIE_NAME))?.value;
    const headerToken = req.headers.get('X-CSRF-Token')
    if (!cookieToken || !headerToken || cookieToken !== headerToken || !secret) return false;

    const parts = cookieToken.split(':');
    if (parts.length !== 3) return false;

    const [token, timestampStr, hmacHex] = parts;
    const timestamp = Number(timestampStr);
    const maxAge = 1000 * 60 * 10; // 10 min
    if (isNaN(timestamp)) return false;
    if (Date.now() - timestamp > maxAge) return false;

    const data = new TextEncoder().encode(`${token}:${timestamp}`);
    const expectedHmac = hmac(sha256, secret, data);
    const expectedHmacHex = toHex(expectedHmac);

    if (hmacHex.length !== expectedHmacHex.length) return false;

    let result = 0;
    for (let i = 0; i < hmacHex.length; i++) {
        result |= hmacHex.charCodeAt(i) ^ expectedHmacHex.charCodeAt(i);
    }
    return result === 0;
}
