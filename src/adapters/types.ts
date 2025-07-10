import { User } from "../react/hooks/types";

export interface AdapterUser extends User {
    passkeys?: Passkey[];
    awaitingTotp?: boolean;
}

export interface Passkey {
    id: string;
    publicKey: Buffer;
    userId: string;
    webAuthnId: Buffer;
    counter: number;
    transports: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Adapter {
    createUser?: (email: string, hashedPassword: string, username?: string) => Promise<AdapterUser>;
    getUser?: (id: string) => Promise<AdapterUser | null>;
    getUserByEmail?: (email: string) => Promise<AdapterUser | null>;
    updateUser?: (userId: string, data: Partial<AdapterUser>) => Promise<AdapterUser>;
    deleteUser?: (userId: string) => Promise<null>;
    createPasskey?: (userId: string, webAuthnId: Buffer, publicKey: Buffer, transports: string) => Promise<Passkey>;
    getPasskey?: (userId: string) => Promise<Passkey[] | null>;
    getPasskeyByEmail?: (email: string) => Promise<Passkey[] | null>;
    getPasskeyByRaw?: (webAuthnId: Buffer<ArrayBuffer>) => Promise<Passkey | null>;
    getPasskeys?: () => Promise<Passkey[] | null>;
    updatePasskey?: (passkeyId: string, data: Partial<Passkey>) => Promise<Passkey>;
    deletePasskey?: (userId: string) => Promise<null>;
    enableTotp?: (userId: string) => Promise<void>;
    disableTotp?: (userId: string) => Promise<void>;
    isTotpEnabled?: (userId: string) => Promise<boolean>;
    createMagicLinkToken?: (email: string, token: string, expires: Date) => Promise<void>;
    getUserByMagicLinkToken?: (token: string) => Promise<AdapterUser | null>;
    deleteMagicLinkToken: (token?: string) => Promise<void>;
}