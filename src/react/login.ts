import axios from "axios";
import { LoginParams } from "./types";

export async function login(params: LoginParams) {
    try {
        const { email, password } = params;

        const csrfToken = getCsrfTokenFromCookie();
        if (!csrfToken) {
            throw new Error("CSRF token not found.");
        }

        const req = await axios.post('/api/auth/login', 
            { email, password },
            { headers: {
                'X-CSRF-Token' : csrfToken
            } });

        return req.data;
    } catch (error) {
        return false;
    }
}

function getCsrfTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;

    const possibleNames = ['auth-kit.csrf_token', '__Secure-auth-kit.csrf_token'];

    for (const name of possibleNames) {
        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(name + '='));
        if (cookie) {
            return decodeURIComponent(cookie.split('=')[1]);
        }
    }

    return null;
}