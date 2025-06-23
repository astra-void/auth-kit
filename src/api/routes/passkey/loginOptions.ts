import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../../core/types";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { storeChallenge } from "../../../core/lib/challenge";

export async function POST(req: NextRequest, config: AuthKitParams) {
    try {
        if (!config.passkey?.rpId || !config.passkey.rpName) {
            return NextResponse.json({ error: "rpId and rpName is required" });
        }
        
        const { email } = await req.json();
        const { adapter } = config;

        const user = await adapter.getUserByEmail?.(email);
        const passkey = await adapter.getPasskeyByEmail?.(email);

        console.log(user, passkey);

        if (!user || !passkey || !user.passkeys) {
            return NextResponse.json({ error: "User not found or no passkeys registered" }, { status: 404 });
        }

        const allowCredentials = user.passkeys.map((p) => ({
            id: Buffer.from(p.webAuthnId).toString("base64url"),
            transports: p.transports.split(",") as AuthenticatorTransport[],
        }));

        const options = await generateAuthenticationOptions({
            timeout: 60000,
            rpID: config.passkey.rpId,
            allowCredentials,
            userVerification: "preferred",
        });

        await storeChallenge(email, options.challenge);

        return NextResponse.json(options, { status: 200 });
    } catch (error) {
        console.error("[INTERNAL ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}