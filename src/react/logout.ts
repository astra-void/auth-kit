import axios from "axios";
import { getCsrfTokenFromCookie } from "./utils";
import { LogoutParams } from "./types";

export async function logout(params: LogoutParams = {}) {
    try {
        const { redirect = true, redirectUrl = '/' } = params;
        const csrfToken = getCsrfTokenFromCookie();
        if (!csrfToken) {
            throw new Error("CSRF token not found.");
        }

        const req = await axios.post('/api/auth/logout', {}, {
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
        console.log(error);
        return false;
    }
}