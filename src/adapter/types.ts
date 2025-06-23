import { User } from "../react/hooks/types";

export interface AdapterUser extends User {
    passkeys?: Passkey[]
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
    getPasskey?: (userId: string) => Promise<Passkey | null>;
    getPasskeyByEmail?: (email: string) => Promise<Passkey | null>;
    createPasskey?: (userId: string, webAuthnID: Uint8Array, publicKey: Buffer, transports: string) => Promise<Passkey>;
    deletePasskey?: (userId: string) => Promise<null>;
}