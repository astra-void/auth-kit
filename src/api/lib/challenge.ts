import { deleteChallengeMap, getChallengeMap, storeChallengeMap } from "../../core/lib/challenge";
import { AuthKitParams } from "../../core/types";

export async function storeChallenge(config: AuthKitParams, userId: string, challenge: string): Promise<void> {
    if (!config.passkey) return;

    const { store = 'custom', challengeStore } = config.passkey;

    switch (store) {
        case 'memory':
            return await storeChallengeMap(userId, challenge);
        case 'redis':
            return await config.passkey.challengeStore?.set(userId, challenge);
        case 'custom':
            return await challengeStore?.set(userId, challenge);
        default:
            throw new Error(`Unsupported challenge store ${store}`);
    };
}

export async function getChallenge(config: AuthKitParams, userId: string): Promise<string | null> {
    if (!config.passkey) return null;

    const { store = 'custom', challengeStore } = config.passkey;

    switch (store) {
        case 'memory':
            return await getChallengeMap(userId) ?? null;
        case 'redis':
            return await config.passkey.challengeStore?.get(userId) ?? null;
        case 'custom':
            return await challengeStore?.get(userId) ?? null;;
        default:
            throw new Error(`Unsupported challenge store ${store}`);
    }
}

export async function deleteChallenge(config: AuthKitParams, userId: string): Promise<void> {
    if (!config.passkey) return;

    const { store = 'custom', challengeStore } = config.passkey;

    switch (store) {
        case 'memory':
            return await deleteChallengeMap(userId);
        case 'redis':
            return await config.passkey.challengeStore?.delete(userId);
        case 'custom':
            return await challengeStore?.delete(userId);
        default:
            throw new Error(`Unsupported challenge store ${store}`);
    }
}