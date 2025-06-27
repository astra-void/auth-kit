import { NextRequest } from "next/server";
import { AdapterUser } from "../adapters";

export type AuthorizeTypes = "oauth" | "email" | "credentials" | "passkey";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Body = Record<string, any>;

export interface Provider {
    name: string;
    type: AuthorizeTypes;
    authorize: (body: Body) => Promise<AdapterUser | null>;
    callback?: (req: NextRequest) => Promise<AdapterUser | null>;
}