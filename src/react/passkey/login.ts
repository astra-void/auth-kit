import axios from "axios";
import { getSession } from "./getSession";

export async function loginPasskey(email: string) {
    try {
        const session = await getSession();

        if (session) {
            throw Error("Already logged in")
        }

        const options = (await axios.post('/api/auth/login/passkey/options', { email })).data;

        console.log(options)

        //const credential = await startAuthentication({ optionsJSON: options });

    } catch (error) {
        console.log("Error during login passkey options: ", error);
    }
}