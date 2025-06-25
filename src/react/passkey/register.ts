/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSession } from "./getSession";
import { startRegistration } from "@simplewebauthn/browser";
import { authRequest } from "../utils";

export async function registerPasskey() {
    try {
        const session = await getSession();

        if (!session) {
            throw Error("Session not found")
        }
        
        const options = (await authRequest<any>('POST', '/api/auth/register/passkey/options', { userId: session.id }))?.options;
        
        let attResp;
        try {
            attResp = await startRegistration({ optionsJSON: options });
        } catch {
            return;
        }

        const verification = (await authRequest<any>('POST', '/api/auth/register/passkey/verify', { credential: attResp }))?.success;

        if (verification) {
            return true;
        }
        
    } catch {
        return false;
    }
}