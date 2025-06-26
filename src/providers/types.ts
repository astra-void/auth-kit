import { NextRequest } from "next/server";
import { AdapterUser } from "../adapters";

export type AuthorizeTypes = "oauth" | "email" | "credentials" | "passkey";

export interface Provider {
    name: string;
    type: AuthorizeTypes;
    authorize: (req: NextRequest) => Promise<AdapterUser | null>;
    callback?: (req: NextRequest) => Promise<AdapterUser | null>;
}