import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../../core/types";
import { deleteChallenge, getChallenge } from "../../../core/lib/challenge";
import { VerifiedAuthenticationResponse, verifyAuthenticationResponse, VerifyAuthenticationResponseOpts } from "@simplewebauthn/server";
import { signJWT } from "../../../jwt";
import { getCookieName } from "../../../core/lib/cookie";

export async function POST(req: NextRequest, config: AuthKitParams) {
    try {
        if (!config.passkey?.rpId || !config.passkey.rpName) {
            return NextResponse.json({ error: "rpId and rpName is required" });
        }

        const { email, credential } = await req.json();
        const { adapter } = config;

        const user = await adapter.getUserByEmail?.(email);
        const passkey = await adapter.getPasskeyByEmail?.(email);

        const expectedChallenge = await getChallenge(email);

        if (!user || !passkey || user.passkeys?.length === 0) {
            return NextResponse.json({ error: "User not found or no passkeys registered" }, { status: 404 });
        }

        if (!expectedChallenge) {
            return NextResponse.json({ error: "Challenge not found" }, { status: 400 });
        }

        const incomingID = Buffer.from(credential.id, "base64url");
        let dbPasskey = null;

        for (const p of user.passkeys!) {
            const savedID = typeof p.webAuthnId === "string"
                ? Buffer.from(p.webAuthnId, "base64url")
                : Buffer.from(p.webAuthnId);
            if (savedID.equals(incomingID)) {
                dbPasskey = p;
                break;
            }
        }

        if (!dbPasskey) {
            return NextResponse.json({ error: "Passkey not registered for this user" }, { status: 400 });
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
            console.error("[VERIFY AUTHENTICATION ERROR]", error);
            return NextResponse.json({ error: (error as Error).message }, { status: 400 });
        } finally {
            await deleteChallenge(email);
        }

        const { verified, authenticationInfo } = verification;
        if (verified) {
            await adapter.updatePasskey?.(email, { counter: authenticationInfo.newCounter });

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
        }

        return NextResponse.json({ success: false });
    } catch (error) {
        console.error("[INTERNAL ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}