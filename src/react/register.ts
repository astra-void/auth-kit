/* eslint-disable @typescript-eslint/no-explicit-any */
import { RegisterParams } from "./types";
import { User } from "./hooks";
import { AdapterUser } from "../adapters";
import { authRequest } from "./utils";
import { getSession } from "./getSession";
import { startRegistration } from "@simplewebauthn/browser";

export async function register(
    provider?: string,
    params?: RegisterParams,
): Promise<User | AdapterUser | null> {
    try {
        const redirect = params?.redirect ?? true;
        const redirectUrl = params?.redirectUrl ?? '/';

        const body: Record<string, any> = { provider: provider ?? "credentials"};

        if (params?.email) body.email = params.email;
        if (params?.password) body.password = params.password;

        if (provider === 'passkey') {
            try {
                const session = await getSession();
        
                if (!session) {
                    throw Error("Session not found")
                }
                
                const options = (await authRequest<any>('POST', '/api/auth/register/passkey/options', { userId: session.id }))?.data.options;
                
                let attResp;
                try {
                    attResp = await startRegistration({ optionsJSON: options });
                } catch {
                    return null;
                }
        
                const verification = (await authRequest<any>('POST', '/api/auth/register', { provider: 'passkey', credential: attResp }))?.data;
        
                if (verification.success) {
                    return verification.user;
                }
                
            } catch {
                return null;
            }
        }

        const req = await authRequest<User | AdapterUser | null>("POST", "/api/auth/register", body);

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