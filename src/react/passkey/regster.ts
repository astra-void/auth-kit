import axios from "axios";
import { useSession } from "../hooks"
import { startRegistration } from "@simplewebauthn/browser";

export async function registerPasskey() {
    try {
        const session = useSession();
        
        const options = (await axios.post('/api/auth/register/passkey/options', { userId: session.user?.id })).data;

        let attResp;
        try {
            attResp = await startRegistration({ optionsJSON: options });
            console.log("Registration response:", attResp);
        } catch (error) {
            console.error("Error during registration:", error);
            return;
        }
        
    } catch {
        console.log("Error during registering passkey options")
    }
}