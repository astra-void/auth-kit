import { Adapter } from "../adapters";
import { HashingAlgorithm } from "../auth";

export interface ChallengeStore {
    get: (userId: string) => Promise<string | null>;
    set: (userId: string, challenge: string) => Promise<void>;
    delete: (userId: string) => Promise<void>;
}

export interface AuthKitParams {
    adapter: Adapter;
    algorithm?: HashingAlgorithm;
    passkey?: {
        rpId: string;
        rpName: string;
        store?: 'memory' | 'redis' | 'custom';
        mode?: 'email' | 'credential'
        challengeStore?: ChallengeStore;
    };
}
