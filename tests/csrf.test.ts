import { NextRequest } from "next/server";
import { CSRF_COOKIE_NAME, generateCsrfToken, verifyCsrf } from "../src/middleware/lib/csrf";

function mockRequestWithToken(token: string): NextRequest {
  const req = {
    cookies: {
      get: (name: string) => name === CSRF_COOKIE_NAME ? { value: token } : undefined,
    },
    headers: {
      get: (key: string) => key === 'X-CSRF-Token' ? token : null,
    },
  } as unknown as NextRequest;

  return req;
}

describe("CSRF Token", () => {
    beforeEach(() => {
        process.env.AUTHKIT_SECRET = "test-secret";
    })

    test("valid token should pass verification", () => {
        const token = generateCsrfToken();
        const req = mockRequestWithToken(token);
        const result = verifyCsrf(req);
        expect(result).toBe(true);
    })

    test("token with modified HMAC should fail", () => {
        const token = generateCsrfToken();
        const tampered = token.replace(/.$/, c => c === 'a' ? 'b' : 'a');
        const req = mockRequestWithToken(tampered);
        const result = verifyCsrf(req);
        expect(result).toBe(false);
    });

    test("token with old timestamp should fail", async () => {
    const now = Date.now() - 1000 * 60 * 11; 
    const tokenPart = "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    const data = `${tokenPart}:${now}`;

    const { hmac } = await import('@noble/hashes/hmac');
    const { sha256 } = await import('@noble/hashes/sha2');
    function toHex(buffer: Uint8Array) {
        return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    const secret = new TextEncoder().encode(process.env.AUTHKIT_SECRET!);
    const hmacDigest = hmac(sha256, secret, new TextEncoder().encode(data));
    const hmacHex = toHex(hmacDigest);
    const token = `${tokenPart}:${now}:${hmacHex}`;

    const req = mockRequestWithToken(token);
    const result = verifyCsrf(req);
    expect(result).toBe(false);
  });

  test("token with invalid format should fail", () => {
    const badToken = "invalid-token";
    const req = mockRequestWithToken(badToken);
    const result = verifyCsrf(req);
    expect(result).toBe(false);
  });

  test("missing header or cookie should fail", () => {
    const badReq = {
      cookies: { get: () => undefined },
      headers: { get: () => null },
    } as unknown as NextRequest;

    const result = verifyCsrf(badReq);
    expect(result).toBe(false);
  });
});