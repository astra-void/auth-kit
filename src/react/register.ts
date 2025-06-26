import { RegisterParams } from "./types";
import { User } from "./hooks";
import { AdapterUser } from "../adapters";
import { authRequest } from "./utils";

export async function register(params: RegisterParams): Promise<User | AdapterUser | null> {
    try {
        const { email, password, redirect = true, redirectUrl = '/' } = params;
        
        const req = await authRequest<User | AdapterUser | null>(
            "POST",
            "/api/auth/register",
            { email, password },
        );

        if (!req?.data || req.status !== 200) {
            return null;
        }

        if (redirect) {
            window.location.href = redirectUrl;
            return null;
        }

        return req.data;
    } catch {
        return null;
    }
}