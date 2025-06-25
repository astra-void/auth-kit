import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../../core/types";
import { VerifiedRegistrationResponse, verifyRegistrationResponse, VerifyRegistrationResponseOpts } from "@simplewebauthn/server";
import { getSession } from "../../../auth/lib/session";
import { deleteChallenge, errorResponse, getChallenge } from "../../lib";
import { verifyCsrf } from "../../../middleware/lib";

function decodeBase64Url(input: string): Uint8Array {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const binary = Buffer.from(base64, "base64");
    return new Uint8Array(binary);
}

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

        const { credential } = await req.json();

        const user = await getSession(config)

        if (!user) {
            return errorResponse("Authentication required", 401);
        }

        const expectedChallenge = await getChallenge(config, user.id);
        if (!expectedChallenge) {
            return errorResponse("Invalid credentials", 401);
        }

        let verified = false;
        let registrationInfo: VerifiedRegistrationResponse["registrationInfo"];
        try {
            const opts: VerifyRegistrationResponseOpts = {
                response: credential,
                expectedChallenge,
                expectedOrigin: req.nextUrl.origin,
                expectedRPID: config.passkey.rpId,
                requireUserVerification: false,
            };

            const verification = await verifyRegistrationResponse(opts);
            verified = verification.verified;
            registrationInfo = verification.registrationInfo;
        } catch {
            return errorResponse("Invalid credentials", 401);
        } finally {
            await deleteChallenge(config, user.id);
        }

        if (!verified || !registrationInfo) {
            return errorResponse("Invalid credentials", 401);
        }

        const { credential: cred } = registrationInfo;

        let webAuthnID: Uint8Array;
        try {
        webAuthnID =
            typeof cred.id === "string"
            ? decodeBase64Url(cred.id)
            : new Uint8Array(cred.id);
        } catch {
            return errorResponse("Invalid credentials", 401);
        }

        const publicKey = Buffer.from(cred.publicKey);
        const transports = cred.transports?.join(",") ?? "";

        await config.adapter.createPasskey?.(
            user.id,
            Buffer.from(webAuthnID),
            publicKey,
            transports
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[AUTH-KIT-ERROR]", error)
        return errorResponse();
    }
}