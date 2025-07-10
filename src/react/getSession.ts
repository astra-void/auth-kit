import axios from "axios";
import { AdapterUser } from "../adapters";
import { User } from "./hooks";

export async function getSession(): Promise<User | AdapterUser | null> {
  try {
    const data = (await axios.get("/api/auth/session")).data.data;
    if (data.user) {
      return data.user;
    }
    return null;
  } catch {
    return null;
  }
};