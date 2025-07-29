import { deleteChallengeMap, getChallengeMap, storeChallengeMap } from "../../core/lib/challenge";
import { PasskeyProviderParams } from "../../providers";

export async function storeChallenge(config: PasskeyProviderParams, userId: string, challenge: string): Promise<void> {
    if (!config) return;

    const { store = 'custom', challengeStore } = config;

    switch (store) {
        case 'memory':
            return await storeChallengeMap(userId, challenge);
        case 'redis':
            return await challengeStore?.set(userId, challenge);
        case 'custom':
            return await challengeStore?.set(userId, challenge);
        default:
            throw new Error(`Unsupported challenge store ${store}`);
    };
}

export async function getChallenge(config: PasskeyProviderParams, userId: string): Promise<string | null> {
    if (!config) return null;

    const { store = 'custom', challengeStore } = config;

    switch (store) {
        case 'memory':
            return await getChallengeMap(userId) ?? null;
        case 'redis':
            return await challengeStore?.get(userId) ?? null;
        case 'custom':
            return await challengeStore?.get(userId) ?? null;;
        default:
            throw new Error(`Unsupported challenge store ${store}`);
    }
}

export async function deleteChallenge(config: PasskeyProviderParams, userId: string): Promise<void> {
    if (!config) return;

    const { store = 'custom', challengeStore } = config;

    switch (store) {
        case 'memory':
            return await deleteChallengeMap(userId);
        case 'redis':
            return await challengeStore?.delete(userId);
        case 'custom':
            return await challengeStore?.delete(userId);
        default:
            throw new Error(`Unsupported challenge store ${store}`);
    }
}