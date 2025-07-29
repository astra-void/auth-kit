import { LogoutParams } from "./types";
import { authRequest } from "./utils";

export async function logout(params: LogoutParams = {}) {
    try {
        const { redirect = true, redirectUrl = '/' } = params;

        const req = await authRequest("POST", "/api/auth/logout");

        if (redirect) {
            window.location.href = redirectUrl;
            return null;
        }

        return req;
    } catch {
        return false;
    }
}