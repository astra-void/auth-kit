import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../../core/types";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { storeChallenge } from "../../../core/lib/challenge";

export async function POST(req: NextRequest, config: AuthKitParams) {
    try {
        if (!config.passkey) {
            return NextResponse.json({ error: "Passkey config is required" }, { status: 400 });
        }
        if (!config.passkey?.rpId || !config.passkey.rpName) {
            return NextResponse.json({ error: "rpId and rpName is required" }, { status: 400 });
        }

        const { mode = 'email' } = config.passkey;
        const { store } = config.passkey;
        
        if (mode === 'email') {
            const { email } = await req.json();
            const { adapter } = config;

            const user = await adapter.getUserByEmail?.(email);
            const passkey = await adapter.getPasskeyByEmail?.(email);

            if (!user || !passkey || user.passkeys?.length === 0) {
                return NextResponse.json({ error: "User not found or no passkeys registered" }, { status: 404 });
            }

            const allowCredentials = passkey.map((p) => ({
                id: Buffer.from(p.webAuthnId).toString("base64url"),
                transports: p.transports.split(",") as AuthenticatorTransport[],
            }));

            const options = await generateAuthenticationOptions({
                timeout: 60000,
                rpID: config.passkey.rpId,
                allowCredentials,
                userVerification: "preferred",
            });

            if (store === 'memory') {
                await storeChallenge(email, options.challenge);
            }

            return NextResponse.json({ options }, { status: 200 });
        }

        if (mode === 'credential') {
            const passkeys = await config.adapter.getPasskeys?.();

            if (!passkeys) {
                return NextResponse.json({ error: "No passkeys found" }, { status: 404 } );
            }

            const allowCredentials = passkeys.map(p => ({
                id: Buffer.from(p.webAuthnId).toString('base64url'),
                type: 'public-key',
                transports: p.transports.split(",") as AuthenticatorTransport[],
            }));

            const options = await generateAuthenticationOptions({
                timeout: 60000,
                rpID: config.passkey.rpId,
                allowCredentials,
                userVerification: "preferred",
            });

            for (const cred of allowCredentials) {
                if (store === 'memory') {
                    await storeChallenge(cred.id, options.challenge);
                }
            }

            return NextResponse.json(options, { status: 200 });
        }
    } catch (error) {
        console.error("[INTERNAL ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}