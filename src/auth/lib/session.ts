import { cookies } from "next/headers";
import { getCookieName } from "../../core/lib/cookie";
import { verifyJWT } from "../../jwt";
import { AuthKitParams } from "../../core/types";

export async function getSession(config: AuthKitParams) {
    try {
        const { adapter } = config;
        const token = (await cookies()).get(getCookieName('auth-kit.session-token'))?.value;
        const secret = process.env.AUTHKIT_SECRET;

        if (!token || !secret) return null;

        const payload = await verifyJWT({ token, secret });
        if (!payload?.sub || !payload?.email || typeof payload?.email !== 'string') {
            return null;
        }

        const user = await adapter.getUser?.(payload.sub);
        if (!user) {
            return null;
        }

        return user;
    } catch {
        return null;
    }
}