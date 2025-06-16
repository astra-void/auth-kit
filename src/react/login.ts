import axios from "axios";
import { LoginParams } from "./types";
import { User } from "./hooks";
import { AdapterUser } from "../adapter";
import { getCsrfTokenFromCookie } from "./utils";

export async function login(params: LoginParams): Promise<User | AdapterUser | null> {
    try {
        const { email, password } = params;

        const csrfToken = getCsrfTokenFromCookie();
        if (!csrfToken) {
            throw new Error("CSRF token not found.");
        }

        const req = await axios.post('/api/auth/login', 
            { email, password },
            { headers: {
                'X-CSRF-Token' : csrfToken
            } });

        return req.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}