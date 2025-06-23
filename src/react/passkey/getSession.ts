import axios from "axios";
import { AdapterUser } from "../../adapter";
import { User } from "../hooks";

export async function getSession(): Promise<User | AdapterUser | null> {
  try {
    const data = (await axios.get("/api/auth/session")).data;
    if (data.user) {
      return data.user;
    }
    return null;
  } catch {
    return null;
  }
}
