import axios from "axios";
import { getSession } from "./getSession";
import { startAuthentication } from "@simplewebauthn/browser";
import { LoginPasskeyParams } from "./types";

export async function loginPasskey(params: LoginPasskeyParams) {
    try {
        const session = await getSession();
        const { email, redirect = true, redirectUrl = '/' } = params;

        if (session) {
            throw Error("Already logged in")
        }

        if (email) {
            const options = (await axios.post('/api/auth/login/passkey/options', { email })).data.options;
            const credential = await startAuthentication({ optionsJSON: options });
            const verification = (await axios.post("/api/auth/login/passkey/verify", { email, credential })).data.success;

            if (verification === true) {
                if (redirect) {
                    window.location.href = redirectUrl
                    return true;
                }
                return true;
            } else {
                return false;
            }
        }

        const options = (await axios.post('/api/auth/login/passkey/options')).data.options;
        const credential = await startAuthentication({ optionsJSON: options });
        const verification = (await axios.post('/api/auth/login/passkey/verify', { credential })).data.success;

        if (verification === true) {
            if (redirect) {
                window.location.href = redirectUrl
                return true;
            }
            return true;
        } else {
            return false;
        }
    } catch {
        return false;
    }
}