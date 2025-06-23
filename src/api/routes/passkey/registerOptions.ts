import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../../core/types";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { storeRegistrationChallenge } from "../../../core/lib/challenge";

export async function POST(req: NextRequest, config: AuthKitParams) {
    try {
        const { userId } = await req.json();

        if (!config.passkey?.rpId || !config.passkey.rpName) {
            return NextResponse.json({ error: "rpId and rpName is required" });
        }

        const user = await config.adapter.getUser?.(userId);

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const options = await generateRegistrationOptions({
            rpName: config.passkey.rpName,
            rpID: config.passkey.rpId,
            userID: new TextEncoder().encode(user.id),
            userName: user.username ?? user.email ?? "unknown-user",
            timeout: 60000,
            attestationType: "none",
            authenticatorSelection: {
                residentKey: "discouraged",
                userVerification: "preferred",
            },
            supportedAlgorithmIDs: [-7, -257],
        });

        if (config.passkey.store === 'memory') {
            storeRegistrationChallenge(userId, options.challenge);
        }

        return NextResponse.json({ options }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}