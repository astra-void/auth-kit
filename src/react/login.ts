/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoginParams } from "./types";
import { User } from "./hooks";
import { AdapterUser } from "../adapters";
import { authRequest } from "./utils";
import { getSession } from "./getSession";
import { startAuthentication } from "@simplewebauthn/browser";

export async function login(
  provider: string, 
  params?: LoginParams
): Promise<User | AdapterUser | null> {
  try {
    const redirect = params?.redirect ?? true;
    const redirectUrl = params?.redirectUrl ?? '/';

    const body: Record<string, any> = { provider };

    if (params?.email) body.email = params.email;
    if (params?.password) body.password = params.password;

    if (provider === 'passkey') {
        try {
            const session = await getSession();

            if (session) {
                throw Error("Already logged in")
            }

            const redirect = params?.redirect ?? true;
            const redirectUrl = params?.redirectUrl ?? '/';

            if (params?.email) {
                const { email } = params;

                const options = (await authRequest<any>('POST', "/api/auth/login/passkey/options", { email }))?.data.options;
                const credential = await startAuthentication({ optionsJSON: options });
                body.credential= credential;

                const verification = (await authRequest<any>('POST', '/api/auth/login', body))?.data.success;
                
                if (verification === true) {
                    if (redirect) {
                        window.location.href = redirectUrl
                    }
                    return null;
                } else {
                    return null;
                }
            }

            const options = (await authRequest<any>('POST', "/api/auth/login/passkey/options"))?.data.options;
            const credential = await startAuthentication({ optionsJSON: options });
            body.credential= credential;

            const verification = (await authRequest<any>('POST', '/api/auth/login', body))?.data.success;

            if (verification === true) {
                if (redirect) {
                    window.location.href = redirectUrl
                }
                return null;
            } else {
                return null;
            }
        } catch {
            return null;
        }
    }

    const req = await authRequest<User | AdapterUser | null>(
      "POST",
      "/api/auth/login",
      body
    );

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