import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../../core/types";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { getSession } from "../../../auth/lib/session";
import { errorResponse, storeChallenge } from "../../lib";
import { verifyCsrf } from "../../../middleware/lib";
import { PasskeyProviderParams } from "../../../providers";

export async function POST(req: NextRequest, config: AuthKitParams) {
    try {
        const passkeyProvider = config.providers.find(p => p.type === 'passkey');
        const options = passkeyProvider?.config as PasskeyProviderParams;
        if (!passkeyProvider || !options) {
            return errorResponse("Passkey provider is not configured", 400);
        }

        if (!options.rpId || !options.rpName) {
            return errorResponse("rpId and rpName is required", 400);
        }
        if (!verifyCsrf(req)) {
            return errorResponse("Invalid CSRF token", 403);
        };

        const { rpId, rpName } = options;

        const user = await getSession(config)

        if (!user) {
            return errorResponse("Authentication required", 401);
        }

        const registrationOptions = await generateRegistrationOptions({
            rpName: rpName,
            rpID: rpId,
            userID: new TextEncoder().encode(user.id),
            userName: user.username ?? user.email ?? "unknown-user",
            userDisplayName: user.username ?? user.email ?? "unknown-user",
            timeout: 60000,
            attestationType: "none",
            authenticatorSelection: {
                residentKey: "discouraged",
                userVerification: "preferred",
            },
            supportedAlgorithmIDs: [-7, -257],
        });

        await storeChallenge(passkeyProvider.config as PasskeyProviderParams, user.id, registrationOptions.challenge);

        return NextResponse.json({ options: registrationOptions }, { status: 200 });
    } catch (error) {
        console.error("[AUTH-KIT-ERROR]", error);
        return errorResponse();
    }
}