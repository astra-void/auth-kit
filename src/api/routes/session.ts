import { NextRequest } from "next/server";
import { AuthKitParams } from "../../core/types";
import { verifyJWT } from "../../jwt";
import { getCookieName } from "../../core/lib/cookie";
import { errorResponse, successResponse } from "../lib";

export async function GET(req: NextRequest, config: AuthKitParams) {
    try {
        const { adapter } = config;
        const token = req.cookies.get(getCookieName('auth-kit.session-token'))?.value;
        const secret = process.env.AUTHKIT_SECRET;

        if (!token || !secret) {
            return successResponse({ data: { user: null }, status: 200 });
        }

        const payload = await verifyJWT({ token, secret });
        if (!payload?.sub || !payload?.email || typeof payload?.email !== 'string') {
            return successResponse({ data: { user: null }, status: 200 });
        }

        const user = await adapter.getUserByEmail?.(payload.email);
        if (!user) {
            return successResponse({ data: { user: null }, status: 200 });
        }

        return successResponse({ data: { user: { id: user.id, email: user.email, ...(user.role && { role: user.role }), } }, status: 200 })
    } catch (error) {
        console.error("[AUTH-KIT-ERROR]", error);
        return errorResponse();
    }
}