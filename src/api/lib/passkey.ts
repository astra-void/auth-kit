/* eslint-disable @typescript-eslint/no-explicit-any */
import { VerifiedAuthenticationResponse, verifyAuthenticationResponse, VerifyAuthenticationResponseOpts } from "@simplewebauthn/server";
import { Passkey } from "../../adapters";
import { PasskeyProviderParams } from "../../providers";

export async function verifyCredential(
    credential: any,
    passkey: Passkey[],
    expectedChallenge: string,
    origin: string,
    config: PasskeyProviderParams,
    userId?: string,
): Promise<{ verification: VerifiedAuthenticationResponse, passkey: Passkey} | null> {
  try {
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
        return null;
    }

    const opts: VerifyAuthenticationResponseOpts = {
        response: credential,
        expectedChallenge: `${expectedChallenge}`,
        expectedOrigin: origin,
        expectedRPID: config.rpId,
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

    const verification = await verifyAuthenticationResponse(opts);
    return { verification, passkey: dbPasskey };
  } catch (error) {
    console.error("[AUTH-KIT-ERROR]", error);
    return null;
  } finally {
    if (config.mode === 'email') {
        await config.challengeStore?.delete?.(userId!);
    } else {
        await config.challengeStore?.delete?.(credential.id);
    }
  }
}
