import axios from "axios";
import { AdapterUser } from "../../adapter";
import { User } from "../hooks";

export async function getSession(): Promise<User | AdapterUser | null> {
  try {
    const res = await axios.get("/api/auth/session");
    return res.data ?? null;
  } catch {
    return null;
  }
}
