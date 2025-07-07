import { NextRequest } from "next/server";
import { AuthKitParams } from "../../core/types";
import { verifyCsrf } from "../../middleware/lib";
import { errorResponse, generateJWT } from "../lib";
import { AdapterUser } from "../../adapters";

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
            const result = await selectedProvider.register?.(body);
            user = result ?? null;
        } catch { /* empty */ }
        
        if (!user) {
            return errorResponse("Invalid credentials", 401);
        }

        return await generateJWT(user);
    } catch (error) {
        console.error("[AUTH-KIT-ERROR]", error)
        return errorResponse();
    }
}