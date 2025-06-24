import { LoginParams } from "./types";
import { User } from "./hooks";
import { AdapterUser } from "../adapter";
import { authRequest } from "./utils";

export async function login(params: LoginParams): Promise<User | AdapterUser | null> {
    try {
        const { email, password, redirect = true, redirectUrl = '/' } = params;
        const req = await authRequest<User | AdapterUser | null>(
            "POST", 
            "/api/auth/login", 
            { email, password }
        );

        if (redirect) {
            window.location.href = redirectUrl
            return null;
        }

        return req;
    } catch {
        return null;
    }
}