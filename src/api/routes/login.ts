import { NextRequest } from "next/server";
import { AuthKitParams } from "../../core/types";
import { verifyCsrf } from "../../middleware/lib";
import { errorResponse, generateJWT, successResponse } from "../lib";
import { AdapterUser } from "../../adapters";
import { deriveTotpSecret, verifyTOTP } from "../../auth/lib/totp";

export async function POST(req: NextRequest, config: AuthKitParams) {  
    try {
        const body = await req.json();
        const { provider } = body;

        if (!verifyCsrf(req)) {
            return errorResponse("Invalid CSRF token", 403);
        };

        const selectedProvider = config.providers.find(p => p.name === provider);
        if (!selectedProvider) {
            return errorResponse("Unknown provider", 400);
        }

        let user: AdapterUser | null = null;
        try {
            user = await selectedProvider.authorize(body);
        } catch { /* empty */ }
        if (!user) {
            return errorResponse("Invalid credentials", 401);
        }

        if (user.awaitingTotp && !body.otpCode) {
            return successResponse({ data: { requiresTotp: true }, status: 200 });
        }

        if (user.awaitingTotp && body.otpCode) {
            const totpSecret = deriveTotpSecret(user.id, process.env.AUTHKIT_SECRET!);
            const valid = verifyTOTP(body.otpCode, totpSecret);
            if (!valid) return errorResponse("Invalid OTP code", 401);
        }

        return await generateJWT(user);
    } catch (error) {
        console.error("[AUTH-KIT-ERROR]", error);
        return errorResponse();
    }
}