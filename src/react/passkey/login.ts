/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSession } from "./getSession";
import { startAuthentication } from "@simplewebauthn/browser";
import { LoginPasskeyParams } from "./types";
import { authRequest } from "../utils";

export async function loginPasskey(params?: LoginPasskeyParams) {
    try {
        const session = await getSession();

        if (session) {
            throw Error("Already logged in")
        }

        const redirect = params?.redirect ?? true;
        const redirectUrl = params?.redirectUrl ?? '/';

        if (params?.email) {
            const { email } = params;

            const options = (await authRequest<any>('POST', "/api/auth/login/passkey/options", { email }))?.options;
            const credential = await startAuthentication({ optionsJSON: options });
            const verification = (await authRequest<any>('POST', '/api/auth/login/passkey/verify', { email, credential }))?.success;
            
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

        const options = (await authRequest<any>('POST', "/api/auth/login/passkey/options"))?.options;
        const credential = await startAuthentication({ optionsJSON: options });
        const verification = (await authRequest<any>('POST', '/api/auth/login/passkey/verify', { credential }))?.success;

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