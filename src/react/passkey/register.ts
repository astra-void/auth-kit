import axios from "axios";
import { getSession } from "./getSession";
import { startRegistration } from "@simplewebauthn/browser";

export async function registerPasskey() {
    try {
        const session = await getSession();

        if (!session) {
            throw Error("Session not found")
        }
        
        const options = (await axios.post('/api/auth/register/passkey/options', { userId: session?.id })).data;
        console.log(options);
        
        let attResp;
        try {
            attResp = await startRegistration({ optionsJSON: options });
            console.log("Registration response:", attResp);
        } catch (error) {
            console.error("Error during registration:", error);
            return;
        }
        
    } catch (error) {
        console.log("Error during registering passkey options: ", error);
    }
}