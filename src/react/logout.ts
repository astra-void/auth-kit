import axios from "axios";

export async function logout() {
    try {
        const req = await axios.post('/api/auth/logout');

        return req.data;
    } catch (error) {
        return false;
    }
}