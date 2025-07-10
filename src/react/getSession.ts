/* eslint-disable @typescript-eslint/no-explicit-any */
import { AdapterUser } from "../adapters";
import { User } from "./hooks";
import { authRequest } from "./utils";

export async function getSession(): Promise<User | AdapterUser | null> {
  try {
    const res = await authRequest<any>("GET", "/api/auth/session");

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