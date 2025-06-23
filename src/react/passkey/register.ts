import axios from "axios";
import { getSession } from "./getSession";
import { startRegistration } from "@simplewebauthn/browser";

export async function registerPasskey() {
    try {
        const session = await getSession();

        if (!session) {
            throw Error("Session not found")
        }
        
        const options = (await axios.post('/api/auth/register/passkey/options', { userId: session?.id })).data.options;
        
        let attResp;
        try {
            attResp = await startRegistration({ optionsJSON: options });
        } catch (error) {
            console.error("Error during registration:", error);
            return;
        }

        const verifyResponse = await axios.post('/api/auth/register/passkey/verify', {
            credential: attResp,
        });

        if (verifyResponse.data.verified) {
            console.log("Registration successful!");
        }
        
    } catch (error) {
        console.log("Error during registering passkey options: ", error);
    }
}