import { AdapterUser } from "../adapters";
import { User } from "./hooks";
import { Session } from "./hooks/types";
import { authRequest } from "./utils";

export async function getSession(): Promise<User | AdapterUser | null> {
  try {
    const res = await authRequest<Session>("GET", "/api/auth/session");

    if (res?.status !== 200 || !res.data) return null;

    const data = res.data.data;

    if (data.user) {
      return data.user;
    }
    return null;
  } catch {
    return null;
  }
};