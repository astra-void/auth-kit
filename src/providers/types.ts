/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { AdapterUser } from "../adapters";

export type AuthorizeTypes = "oauth" | "email" | "magiclink" | "credentials" | "passkey";

export type Body = Record<string, any>;

export interface Provider {
    name: string;
    type: AuthorizeTypes;
    config?: Record<string, any>;
    authorize: (body: Body) => Promise<AdapterUser | null>;
    register?: (body: Body) => Promise<AdapterUser | void | null>;
    callback?: (req: NextRequest) => Promise<AdapterUser | null>;
}

export interface ChallengeStore {
    get: (userId: string) => Promise<string | null>;
    set: (userId: string, challenge: string) => Promise<void>;
    delete: (userId: string) => Promise<void>;
}

export interface PasskeyProviderParams {
    rpId: string;
    rpName: string;
    store?: 'memory' | 'redis' | 'custom';
    mode?: 'email' | 'credential'
    challengeStore?: ChallengeStore;    
}