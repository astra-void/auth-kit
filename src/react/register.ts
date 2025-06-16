import axios from "axios";
import { RegisterParams } from "./types";
import { User } from "./hooks";
import { AdapterUser } from "../adapter";
import { getCsrfTokenFromCookie } from "./utils";

export async function register(params: RegisterParams): Promise<User | AdapterUser | null> {
    try {
        const { email, password, redirect = true, redirectUrl = '/' } = params;
        
        const csrfToken = getCsrfTokenFromCookie();
        if (!csrfToken) {
            throw new Error("CSRF token not found.");
        }

        const req = await axios.post('/api/auth/register', { email, password }, {
            headers: {
                'X-CSRF-Token' : csrfToken,
            }
        });
        if (redirect) {
            window.location.href = redirectUrl;
            return null;
        }

        return req.data;
    } catch (error) {
        return null;
    }
}