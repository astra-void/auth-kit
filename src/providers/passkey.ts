import { VerifiedRegistrationResponse, verifyRegistrationResponse, VerifyRegistrationResponseOpts } from "@simplewebauthn/server";
import { deleteChallenge, getChallenge } from "../api/lib";
import { verifyCredential } from "../api/lib/passkey";
import { getSession } from "../auth/lib/session";
import { getGlobalConfig } from "../core";
import { PasskeyProviderParams, Provider } from "./types";

function decodeBase64Url(input: string): Uint8Array {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const binary = Buffer.from(base64, "base64");
    return new Uint8Array(binary);
}

export function PasskeyProvider(params: PasskeyProviderParams): Provider {
    return {
        name: "passkey",
        type: "passkey",
        config: params,
        authorize: async (body) => {
            try {
                const config = getGlobalConfig();
                if (!config) return null;

                const { mode = 'email'} = params;

                if (mode === 'email') {
                    const { email, credential } = body;
                    const { adapter } = config;
        
                    const user = await adapter.getUserByEmail?.(email);
                    const passkey = await adapter.getPasskeyByEmail?.(email);
        
                    if (!user || !passkey || passkey.length === 0) {
                        return null
                    }
        
                    const expectedChallenge = await getChallenge(params, user.id)

                    if (!expectedChallenge) {
                        return null;
                    }

                    const origin = process.env.AUTHKIT_ORIGIN!;
                    const response = await verifyCredential(credential, passkey, expectedChallenge, origin, params, user.id);
                    if (!response) return null;

                    const { verification, passkey: dbPasskey } = response;
                    const { verified, authenticationInfo } = verification;
                    if (verified) {
                        const newCounter = authenticationInfo.newCounter;
                        if (newCounter > dbPasskey.counter) {
                            await adapter.updatePasskey?.(dbPasskey.id, { counter: newCounter });
                        }
        
                        return user;
                    }
        
                    return null;
                }
                if (mode === 'credential') {
                    const { credential } = body;
                    const { adapter } = config;
        
                    const webAuthnIDBuffer = Buffer.from(credential.id, "base64url");
                    const passkey = await adapter.getPasskeyByRaw?.(webAuthnIDBuffer);
                    if (!passkey) {
                        return null;
                    }
        
                    const user = await adapter.getUser?.(passkey.userId);
        
                    if (!user?.passkeys) {
                        return null;
                    }
        
                    if (!user || user.passkeys.length === 0) {
                        return null;
                    }
        
                    const expectedChallenge = await getChallenge(params, credential.id);
                    if (!expectedChallenge) {
                        return null;
                    }
        
                    const origin = process.env.AUTHKIT_ORIGIN!;
                    const response = await verifyCredential(credential, user.passkeys, expectedChallenge, origin, params, user.id);
                    if (!response) return null;

                    const { verification, passkey: dbPasskey } = response;
                    const { verified, authenticationInfo } = verification;
                    if (verified) {
                        const newCounter = authenticationInfo.newCounter;
                        if (newCounter > dbPasskey.counter) {
                            await adapter.updatePasskey?.(dbPasskey.id, { counter: newCounter });
                        }
        
                        return user;
                    }
        
                    return null;
                }

                return null;
            } catch (error) {
                console.error("[AUTH-KIT-ERROR]", error)
                return null;
            }
        },
        register: async (body) => {
             try {
                const config = getGlobalConfig();
                if (!config) return null;

                const { credential } = body;
                const { rpId } = params;
        
                const user = await getSession(config)
        
                if (!user) {
                    return null;
                }               
        
                const expectedChallenge = await getChallenge(params, user.id);
                if (!expectedChallenge) {
                    return null;
                }
        
                let verified = false;
                let registrationInfo: VerifiedRegistrationResponse["registrationInfo"];
                try {
                    const opts: VerifyRegistrationResponseOpts = {
                        response: credential,
                        expectedChallenge,
                        expectedOrigin: process.env.AUTHKIT_ORIGIN!,
                        expectedRPID: rpId,
                        requireUserVerification: false,
                    };
        
                    const verification = await verifyRegistrationResponse(opts);
                    verified = verification.verified;
                    registrationInfo = verification.registrationInfo;
                } catch (error) {
                    console.error("[AUTH-KIT-ERROR]", error)
                    return null;
                } finally {
                    await deleteChallenge(params, user.id);
                }
        
                if (!verified || !registrationInfo) {
                    return null;
                }
        
                const { credential: cred } = registrationInfo;
        
                let webAuthnID: Uint8Array;
                try {
                webAuthnID =
                    typeof cred.id === "string"
                    ? decodeBase64Url(cred.id)
                    : new Uint8Array(cred.id);
                } catch {
                    return null;
                }
        
                const publicKey = Buffer.from(cred.publicKey);
                const transports = cred.transports?.join(",") ?? "";
        
                await config.adapter.createPasskey?.(
                    user.id,
                    Buffer.from(webAuthnID),
                    publicKey,
                    transports
                );
        
                return user;
            } catch (error) {
                console.error("[AUTH-KIT-ERROR]", error)
                return null;
            }
        }
    };
}