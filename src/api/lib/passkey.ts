/* eslint-disable @typescript-eslint/no-explicit-any */
import { VerifiedAuthenticationResponse, verifyAuthenticationResponse, VerifyAuthenticationResponseOpts } from "@simplewebauthn/server";
import { Passkey } from "../../adapters";

export async function verifyCredential(
    credential: any,
    passkey: Passkey,
    expectedChallenge: string,
    origin: string,
    config: any,
    userId?: string,
): Promise<VerifiedAuthenticationResponse | null> {
  try {
    const opts: VerifyAuthenticationResponseOpts = {
        response: credential,
        expectedChallenge: `${expectedChallenge}`,
        expectedOrigin: origin,
        expectedRPID: config.passkey.rpId,
        credential: {
            id: typeof passkey.webAuthnId === "string"
            ? passkey.webAuthnId
            : Buffer.from(passkey.webAuthnId).toString("base64url"),
            publicKey: typeof passkey.publicKey === "string"
            ? Buffer.from(passkey.publicKey, "base64url")
            : passkey.publicKey,
            counter: passkey.counter,
            transports: passkey.transports.split(",") as AuthenticatorTransport[],
        },
        requireUserVerification: false,
    };

    const verification = await verifyAuthenticationResponse(opts);
    return verification;
  } catch (error) {
    console.error("[AUTH-KIT-ERROR]", error);
    return null;
  } finally {
    if (config.mode === 'email') {
        await config.deleteChallenge?.(userId);
    } else {
        await config.deleteChallenge?.(credential.id);
    }
  }
}
