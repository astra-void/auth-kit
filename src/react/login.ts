import axios from "axios";
import { LoginParams } from "./types";

export async function login(params: LoginParams) {
    try {
        const { email, password } = params;

        const { data } = await axios.get('/api/auth/csrf');
        const csrfToken = data.csrfToken;

        const req = await axios.post('/api/auth/login', 
            { email, password },
            { headers: {
                'X-CSRF-Token' : csrfToken
            } });

        return req.data;
    } catch (error) {
        return false;
    }
}