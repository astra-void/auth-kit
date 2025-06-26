import { LoginParams } from "./types";
import { User } from "./hooks";
import { AdapterUser } from "../adapters";
import { authRequest } from "./utils";

export async function login(
  provider: string, 
  params?: LoginParams
): Promise<User | AdapterUser | null> {
  try {
    const redirect = params?.redirect ?? true;
    const redirectUrl = params?.redirectUrl ?? '/';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: Record<string, any> = { provider };

    if (params?.email) body.email = params.email;
    if (params?.password) body.password = params.password;

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