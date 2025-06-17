import { User } from "../react/hooks/types";

export type AdapterUser = User

export interface Adapter {
    createUser?: (email: string, hashedPassword: string) => Promise<AdapterUser>;
    getUser?: (id: string) => Promise<AdapterUser>;
    getUserByEmail?: (email: string) => Promise<AdapterUser | null>;
    updateUser?: (user: AdapterUser) => Promise<AdapterUser>;
    deleteUser?: (userId: string) => Promise<null>;
}