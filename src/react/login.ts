import axios from "axios";
import { LoginParams } from "./types";

export async function login(params: LoginParams) {
    try {
        const { email, password } = params;
        const req = await axios.post('/api/auth/login', 
            { email, password },
            { headers: {
                'X-CSRF-Token' : ''
            } });
    } catch (error) {
        return false;
    }
}