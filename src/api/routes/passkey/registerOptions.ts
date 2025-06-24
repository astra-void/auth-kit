import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../../core/types";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { getSession } from "../../../auth/lib/session";
import { storeChallenge } from "../../lib";

export async function POST(req: NextRequest, config: AuthKitParams) {
    try {
        if (!config.passkey?.rpId || !config.passkey.rpName) {
            return NextResponse.json({ error: "rpId and rpName is required" });
        }

        const user = await getSession(config)

        if (!user) {
            return NextResponse.json({ success: false, message: "Not logged in" }, { status: 401 });
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
        console.error("[INTERNAL ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}