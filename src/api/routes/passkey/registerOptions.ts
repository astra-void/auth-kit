import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../../core/types";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { getSession } from "../../../auth/lib/session";
import { errorResponse, storeChallenge } from "../../lib";
import { verifyCsrf } from "../../../middleware/lib";

export async function POST(req: NextRequest, config: AuthKitParams) {
    try {
        if (!config.passkey) {
            return errorResponse("Passkey config is required", 400);
        }
        if (!config.passkey?.rpId || !config.passkey.rpName) {
            return errorResponse("rpId and rpName is required", 400);
        }
        if (!verifyCsrf(req)) {
            return errorResponse("Invalid CSRF token", 403);
        };

        const user = await getSession(config)

        if (!user) {
            return errorResponse("Authentication required", 401);
        }

        const options = await generateRegistrationOptions({
            rpName: config.passkey.rpName,
            rpID: config.passkey.rpId,
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

        await storeChallenge(config, user.id, options.challenge);

        return NextResponse.json({ options }, { status: 200 });
    } catch (error) {
        console.error("[AUTH-KIT-ERROR]", error);
        return errorResponse();
    }
}