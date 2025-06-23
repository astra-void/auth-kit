import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../../core/types";
import { deleteRegistrationChallenge, getRegistrationChallenge } from "../../../core/lib/challenge";
import { VerifiedRegistrationResponse, verifyRegistrationResponse, VerifyRegistrationResponseOpts } from "@simplewebauthn/server";
import { getSession } from "../../../auth/lib/session";

function decodeBase64Url(input: string): Uint8Array {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const binary = Buffer.from(base64, "base64");
    return new Uint8Array(binary);
}

export async function POST(req: NextRequest, config: AuthKitParams) {
    try {
        if (!config.passkey?.rpId || !config.passkey.rpName) {
            return NextResponse.json({ error: "rpId and rpName is required" });
        }

        const { credential } = await req.json();

        const user = await getSession(config)

        if (!user) {
            return NextResponse.json({ error: "Not logged in" }, { status: 401 });
        }

        let expectedChallenge: string | undefined = undefined;
        if (config.passkey?.store === 'memory') {
            expectedChallenge = getRegistrationChallenge(user.id) ?? undefined;
        } else if (config.passkey?.store === 'redis') {
            // TODO: Implement Redis challenge store
            return NextResponse.json(
                { error: "Redis store not implemented yet" },
                { status: 501 }
            );
        }

        if (!expectedChallenge) {
            return NextResponse.json({ error: "No stored challenge" }, { status: 400 });
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
        } catch (error) {
            console.error("[VERIFY REGISTRATION ERROR]", error);
            return NextResponse.json({ error: (error as Error).message }, { status: 400 });
        } finally {
            deleteRegistrationChallenge(user.id);
        }

        if (!verified || !registrationInfo) {
            return NextResponse.json({ error: "Verification failed" }, { status: 400 });
        }

        const { credential: cred } = registrationInfo;

        let webAuthnID: Uint8Array;
        try {
        webAuthnID =
            typeof cred.id === "string"
            ? decodeBase64Url(cred.id)
            : new Uint8Array(cred.id);
        } catch {
            return NextResponse.json({ error: "Invalid credential ID" }, { status: 400 });
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
        console.error("[INTERNAL ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}