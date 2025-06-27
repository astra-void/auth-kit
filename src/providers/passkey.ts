import { getChallenge } from "../api/lib";
import { verifyCredential } from "../api/lib/passkey";
import { getGlobalConfig } from "../core";
import { Provider } from "./types";

export function PasskeyProvider(): Provider {
    return {
        name: "passkey",
        type: "passkey",
        authorize: async (body) => {
            try {
                const config = getGlobalConfig();
                if (!config?.passkey) return null;

                const { mode = 'email' } = config.passkey;
                if (mode === 'email') {
                    const { email, credential } = body;
                    const { adapter } = config;
        
                    const user = await adapter.getUserByEmail?.(email);
                    const passkey = await adapter.getPasskeyByEmail?.(email);
        
                    if (!user || !passkey || passkey.length === 0) {
                        return null
                    }
        
                    const expectedChallenge = await getChallenge(config, user.id)
        
                    if (!expectedChallenge) {
                        return null;
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
                        return null;
                    }

                    const origin = process.env.AUTHKIT_ORIGN!;
                    const verification = await verifyCredential(credential, dbPasskey, expectedChallenge, origin, config, user.id);
                    if (!verification) return null;

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
        
                    const expectedChallenge = await getChallenge(config, credential.id);
                    if (!expectedChallenge) {
                        return null;
                    }
        
                    const incomingID = Buffer.from(credential.id, "base64url");
                    const dbPasskey = user.passkeys.find(p => {
                    const savedID = Buffer.isBuffer(p.webAuthnId)
                        ? p.webAuthnId
                        : Buffer.from(p.webAuthnId);
                    return savedID.equals(incomingID);
                    });
        
                    if (!dbPasskey) {
                        return null;
                    }
        
                    const origin = process.env.AUTHKIT_ORIGN!;
                    const verification = await verifyCredential(credential, dbPasskey, expectedChallenge, origin, config)
                    if (!verification) return null;

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
        }
    };
}