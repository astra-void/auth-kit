import { User } from "../auth";

export interface AdapterUser extends User {
    
}

export interface Adapter {
    createUser?: (email: string, hashedPassword: string) => Promise<AdapterUser>;
    getUser?: (id: string) => Promise<AdapterUser>;
    getUserByEmail?: (email: string) => Promise<AdapterUser | null>;
    updateUser?: (user: AdapterUser) => Promise<AdapterUser>;
    deleteUser?: (userId: string) => Promise<null>;
}