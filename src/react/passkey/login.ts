import axios from "axios";
import { getSession } from "./getSession";
import { startAuthentication } from "@simplewebauthn/browser";
import { LoginPasskeyParams } from "./types";

export async function loginPasskey(params: LoginPasskeyParams) {
    try {
        const session = await getSession();
        const { email, redirect = true, redirectUrl = '/' } = params;

        if (session) {
            throw Error("Already logged in")
        }

        const options = (await axios.post('/api/auth/login/passkey/options', { email })).data;

        const credential = await startAuthentication({ optionsJSON: options });

        const verification = (await axios.post("/api/auth/login/passkey/verify", { email, credential })).data.success;

        if (verification === true) {
             if (redirect) {
                window.location.href = redirectUrl
                return true;
            }
            return true;
        } else {
            return false;
        }

    } catch (error) {
        console.log("Error during login passkey options: ", error);
    }
}