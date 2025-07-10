import { AdapterUser } from "../adapters";
import { User } from "./hooks";

export async function getSession(): Promise<User | AdapterUser | null> {
  try {
    const res = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) return null;

    const json = await res.json()
    const data = json.data;

    if (data.user) {
      return data.user;
    }
    return null;
  } catch {
    return null;
  }
};