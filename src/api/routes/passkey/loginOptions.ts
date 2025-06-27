import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../../core/types";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { errorResponse, storeChallenge } from "../../lib";
import { PasskeyProviderParams } from "../../../providers";
import { verifyCsrf } from "../../../middleware/lib";

export async function POST(req: NextRequest, config: AuthKitParams) {
    try {
        if (!verifyCsrf(req)) {
            return errorResponse("Invalid CSRF token", 403);
        };

        const passkeyProvider = config.providers.find(p => p.type === 'passkey');
        const options = passkeyProvider?.config as PasskeyProviderParams;
        if (!passkeyProvider || !options) {
            return errorResponse("Passkey provider is not configured", 400);
        }

        const { rpId, mode = 'email' } = options;
        const { adapter } = config;
        
        if (mode === 'email') {
            const { email } = await req.json();

            const user = await adapter.getUserByEmail?.(email);
            const passkey = await adapter.getPasskeyByEmail?.(email);

            if (!user || !passkey || user.passkeys?.length === 0) {
                return errorResponse("Invalid credentials", 401);
            }

            const allowCredentials = passkey.map((p) => ({
                id: Buffer.from(p.webAuthnId).toString("base64url"),
                transports: p.transports.split(",") as AuthenticatorTransport[],
            }));

            const options = await generateAuthenticationOptions({
                timeout: 60000,
                rpID: rpId,
                allowCredentials,
                userVerification: "preferred",
            });

            await storeChallenge(passkeyProvider.config as PasskeyProviderParams, user.id, options.challenge);

            return NextResponse.json({ options }, { status: 200 });
        }

        if (mode === 'credential') {
            const passkeys = await adapter.getPasskeys?.();

            if (!passkeys) {
                return errorResponse("Invalid credentials", 401);
            }

            const allowCredentials = passkeys.map(p => ({
                id: Buffer.from(p.webAuthnId).toString('base64url'),
                type: 'public-key',
                transports: p.transports.split(",") as AuthenticatorTransport[],
            }));

            const options = await generateAuthenticationOptions({
                timeout: 60000,
                rpID: rpId,
                allowCredentials,
                userVerification: "preferred",
            });

            await Promise.all(
                allowCredentials.map((cred) => 
                    storeChallenge(passkeyProvider.config as PasskeyProviderParams, cred.id, options.challenge)
                )
            );

            return NextResponse.json({ options }, { status: 200 });
        }
    } catch (error) {
        console.error("[AUTH-KIT-ERROR]", error)
        return errorResponse();
    }
}