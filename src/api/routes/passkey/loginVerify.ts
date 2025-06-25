import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../../core/types";
import { VerifiedAuthenticationResponse, verifyAuthenticationResponse, VerifyAuthenticationResponseOpts } from "@simplewebauthn/server";
import { signJWT } from "../../../jwt";
import { getCookieName } from "../../../core/lib/cookie";
import { deleteChallenge, errorResponse, getChallenge } from "../../lib";
import { verifyCsrf } from "../../../middleware/lib";

export async function POST(req: NextRequest, config: AuthKitParams) {
    try {
        if (!config.passkey) {
            return errorResponse("Passkey config is required", 400);
        }
        if (!config.passkey?.rpId || !config.passkey.rpName) {
            return errorResponse("rpId and rpName is required", 400);
        }
        if (!verifyCsrf(req)) {
            return errorResponse("Invalid CSRF token", 403);
        };

        const { mode = 'email' } = config.passkey;
        
        if (mode === 'email') {
            const { email, credential } = await req.json();
            const { adapter } = config;

            const user = await adapter.getUserByEmail?.(email);
            const passkey = await adapter.getPasskeyByEmail?.(email);

            if (!user || !passkey || passkey.length === 0) {
                return errorResponse("Invalid credentials", 401);
            }

            const expectedChallenge = await getChallenge(config, user.id)

            if (!expectedChallenge) {
                return errorResponse("Invalid credentials", 401);
            }

            const incomingID = Buffer.from(credential.id, "base64url");
            let dbPasskey = null;

            for (const p of passkey) {
                const savedID = typeof p.webAuthnId === "string"
                    ? Buffer.from(p.webAuthnId, "base64url")
                    : Buffer.from(p.webAuthnId);
                if (savedID.equals(incomingID)) {
                    dbPasskey = p;
                    break;
                }
            }

            if (!dbPasskey) {
                return errorResponse("Invalid credentials", 401);
            }

            let verification: VerifiedAuthenticationResponse;
            try {
                const opts: VerifyAuthenticationResponseOpts = {
                    response: credential,
                    expectedChallenge: `${expectedChallenge}`,
                    expectedOrigin: req.nextUrl.origin,
                    expectedRPID: config.passkey.rpId,
                    credential: {
                    id: typeof dbPasskey.webAuthnId === "string"
                        ? dbPasskey.webAuthnId
                        : Buffer.from(dbPasskey.webAuthnId).toString("base64url"),
                    publicKey: typeof dbPasskey.publicKey === "string"
                        ? Buffer.from(dbPasskey.publicKey, "base64url")
                        : dbPasskey.publicKey,
                    counter: dbPasskey.counter,
                    transports: dbPasskey.transports.split(",") as AuthenticatorTransport[],
                    },
                    requireUserVerification: false,
                };
                verification = await verifyAuthenticationResponse(opts);
            } catch (error) {
                console.error("[AUTH-KIT-ERROR]", error)
                return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
            } finally {
                await deleteChallenge(config, user.id);
            }

            const { verified, authenticationInfo } = verification;
            if (verified) {
                await adapter.updatePasskey?.(dbPasskey.id, { counter: authenticationInfo.newCounter });

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

            return NextResponse.json({ success: false });
        }
        if (mode === 'credential') {
            const { credential } = await req.json();

            const webAuthnIDBuffer = Buffer.from(credential.id, "base64url");
            const passkey = await config.adapter.getPasskeyByRaw?.(webAuthnIDBuffer);
            if (!passkey) {
                return errorResponse("Invalid credentials", 401);
            }

            const user = await config.adapter.getUser?.(passkey.userId);

            if (!user?.passkeys) {
                return errorResponse("Invalid credentials", 401);
            }

            if (!user || user.passkeys.length === 0) {
                return errorResponse("Invalid credentials", 401);
            }

            const expectedChallenge = await getChallenge(config, credential.id);
            if (!expectedChallenge) {
                return errorResponse("Invalid credentials", 401);
            }

            const incomingID = Buffer.from(credential.id, "base64url");
            const dbPasskey = user.passkeys.find(p => {
            const savedID = Buffer.isBuffer(p.webAuthnId)
                ? p.webAuthnId
                : Buffer.from(p.webAuthnId);
            return savedID.equals(incomingID);
            });

            if (!dbPasskey) {
                return errorResponse("Invalid credentials", 401);
            }

            let verification: VerifiedAuthenticationResponse;
            try {
            const opts: VerifyAuthenticationResponseOpts = {
                response: credential,
                expectedChallenge,
                expectedOrigin: req.nextUrl.origin,
                expectedRPID: config.passkey.rpId,
                credential: {
                id: Buffer.isBuffer(dbPasskey.webAuthnId)
                    ? dbPasskey.webAuthnId.toString("base64url")
                    : Buffer.from(dbPasskey.webAuthnId).toString("base64url"),
                publicKey: Buffer.isBuffer(dbPasskey.publicKey)
                    ? dbPasskey.publicKey
                    : Buffer.from(dbPasskey.publicKey),
                counter: dbPasskey.counter,
                transports: dbPasskey.transports.split(",") as AuthenticatorTransport[],
                },
                requireUserVerification: false,
            };
            verification = await verifyAuthenticationResponse(opts);
            } catch (error) {
                console.error("[AUTH-KIT-ERROR]", error)
                return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
            }

            const { verified, authenticationInfo } = verification;
            if (verified) {
                await config.adapter.updatePasskey?.(dbPasskey.id, { counter: authenticationInfo.newCounter });

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

                await deleteChallenge(config, credential.id);
                
                return res;
            }

            return NextResponse.json({ verified: false });
        }
    } catch (error) {
        console.error("[AUTH-KIT-ERROR]", error)
        return errorResponse();
    }
}