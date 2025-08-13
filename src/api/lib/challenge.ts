import { deleteChallengeMap, getChallengeMap, storeChallengeMap } from "../../core/lib/challenge";
import { PasskeyProviderParams } from "../../providers";

export async function storeChallenge(config: PasskeyProviderParams, userId: string, challenge: string): Promise<void> {
    if (!config) return;

    const { challengeStore } = config;

    if (!challengeStore) {
        return await storeChallengeMap(userId, challenge);
    }
    return await challengeStore?.set(userId, challenge);
}

export async function getChallenge(config: PasskeyProviderParams, userId: string): Promise<string | null> {
    if (!config) return null;

    const { challengeStore } = config;

    if (!challengeStore) {
        return await getChallengeMap(userId) ?? null;
    }
    return await challengeStore?.get(userId) ?? null;
}

export async function deleteChallenge(config: PasskeyProviderParams, userId: string): Promise<void> {
    if (!config) return;

    const { challengeStore } = config;

    if (!challengeStore) {
        return await deleteChallengeMap(userId);
    }
    return await challengeStore?.delete(userId);
}