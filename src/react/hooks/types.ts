import { AdapterUser } from "../../adapter";

export interface User {
    id: string;
    username?: string;
    email?: string;
    hashedPassword?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type SessionStatus = 'authenticated' | 'unauthenticated' | 'loading';

export interface UseSessionResult {
  data: User | AdapterUser | null;
  status: SessionStatus;
}