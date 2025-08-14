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
): Promise<User | AdapterUser | any |null> {
  try {
    const redirect = params?.redirect ?? true;
    const redirectUrl = params?.redirectUrl ?? '/';

    const body: Record<string, any> = { provider };

    if (params?.email) body.email = params.email;
    if (params?.password) body.password = params.password;
    if (params?.otpCode) body.otpCode = params.otpCode;

    if (provider === 'passkey') {
        try {
            const session = await getSession();

            if (session) {
                throw Error("Already logged in")
            }

            if (params?.email) {
                const { email } = params;

                const optionsRes = (await authRequest<any>('POST', "/api/auth/login/passkey/options", { email }));
                const authOptions = optionsRes?.data?.authOptions ?? optionsRes?.data
                const credential = await startAuthentication({ optionsJSON: authOptions });
                body.credential = credential;

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

            const optionsRes = (await authRequest<any>('POST', "/api/auth/login/passkey/options"));
            const authOptions = optionsRes?.data?.authOptions ?? optionsRes?.data
            const credential = await startAuthentication({ optionsJSON: authOptions });
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

    const req = await authRequest<AdapterUser | any | null>(
      "POST",
      "/api/auth/login",
      body
    );
    if (!req) return null;

    const { status } = req;
    const { data } = req.data
    if (!data || status !== 200) {
      return null;
    }
    
    if (data.requiresTotp && !params?.otpCode) {
      return { requiresTotp: true };
    }

    if (data.success === true) {
      if (redirect) {
        window.location.href = redirectUrl
        return null;
      }

      return data;
    }
  } catch {
    return null;
  }
}