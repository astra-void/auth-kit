import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../../core/types";
import { deleteRegistrationChallenge, getRegistrationChallenge } from "../../../core/lib/challenge";
import { VerifiedRegistrationResponse, verifyRegistrationResponse, VerifyRegistrationResponseOpts } from "@simplewebauthn/server";

export async function POST(req: NextRequest, config: AuthKitParams) {
    try {
        const { userId, credential } = await req.json();

        const user = await config.adapter.getPasskey?.(userId);
        
        let expectedChallenge: string | undefined = undefined;
        if (config.passkey?.store === 'memory') {
            expectedChallenge = getRegistrationChallenge(userId) ?? undefined;
        } else if (config.passkey?.store === 'redis') {
            // TODO: complete this logic
            return;
        }

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!expectedChallenge) {
            return NextResponse.json({ error: "No stored challenge" }, { status: 400 });
        }

         let verification: VerifiedRegistrationResponse;
    try {
      const opts: VerifyRegistrationResponseOpts = {
        response: credential,
        expectedChallenge: `${expectedChallenge}`,
        expectedOrigin: req.nextUrl.origin,
        expectedRPID: config.passkey?.rpId,
        requireUserVerification: false,
      };
      verification = await verifyRegistrationResponse(opts);
    } catch (error) {
      console.error("[VERIFY REGISTRATION ERROR]", error);
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }

    const { verified, registrationInfo } = verification;
    if (verified && registrationInfo) {
        const { credential  } = registrationInfo;

        const webAuthnID = typeof credential.id === "string"
            ? Uint8Array.from(atob(credential.id.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0))
            : new Uint8Array(credential.id);
        const publicKey = Buffer.from(credential.publicKey);
        const transports = credential.transports?.join(",") ?? "";
    
        await config.adapter.createPasskey?.(user.id, webAuthnID, publicKey, transports);
      
        deleteRegistrationChallenge(user.id);
    }

        return NextResponse.json({  });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}