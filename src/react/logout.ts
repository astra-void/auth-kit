import axios from "axios";
import { getCsrfTokenFromCookie } from "./utils";

export async function logout() {
    try {
        const csrfToken = getCsrfTokenFromCookie();
        if (!csrfToken) {
            throw new Error("CSRF token not found.");
        }

        const req = await axios.post('/api/auth/logout', {}, {
            headers: {
                'X-CSRF-Token' : csrfToken,
            }
        });

        return req.data;
    } catch (error) {
        return false;
    }
}