import { NextRequest } from "next/server";
import { verifyCsrf } from "../../middleware/lib";
import { getCookieName } from "../../core/lib/cookie";
import { errorResponse, successResponse } from "../lib";

export async function POST(req: NextRequest) {
    try {
        if (!verifyCsrf(req)) {
            return errorResponse("Invalid CSRF token", 403);
        };

        const sessionToken = req.cookies.get(getCookieName('auth-kit.session-token'));
        if (!sessionToken) {
            return errorResponse("Already logged out", 401);
        }

        const res = successResponse({ message: "Logged out", status: 200 });
        res.cookies.delete(getCookieName('auth-kit.session-token'))

        return res;
    } catch (error) {
        console.error("[AUTH-KIT-ERROR]", error);
        return errorResponse();
    }
}