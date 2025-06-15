import axios from "axios";
import { RegisterParams } from "./types";
import { User } from "./hooks";
import { AdapterUser } from "../adapter";

export async function register(params: RegisterParams): Promise<User | AdapterUser | null> {
    try {
        const { email, password } = params;
        
        const req = await axios.post('/api/auth/register', { email, password });
        
        return req.data;
    } catch (error) {
        return null;
    }
}