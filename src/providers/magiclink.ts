import { getGlobalConfig } from "../core";
import { sendEmail } from "../core/lib";
import { signJWT } from "../jwt";
import { Provider } from "./types";

export function MagiclinkProvider(
    // callback?: (req: Request) => Promise<AdapterUser | null>,
    override?: Partial<Provider>,
): Provider {
    return {
        name: "magiclink",
        type: "magiclink",
        authorize: async (body) => {
            const config = getGlobalConfig();
            const { adapter } = config!;
            const { email } = body;

            if (!email) return null;

            const user = await adapter.getUserByEmail?.(email);
            if (!user) return null;

            const token = await signJWT({
                payload: {
                    sub: user.id,
                    email: user.email
                },
                secret: process.env.AUTHKIT_SECRET!,
                options: {
                    maxAge: 15 * 60,
                }
            });

            const callbackUrl = `${process.env.AUTHKIT_ORIGIN}/api/auth/callback?token=${token}`;

            await sendEmail({
                to: user.email!,
                subject: "Your magic login link",
                html: `<p>Click <a href="${callbackUrl}">here</a> to sign in.</p>`,
            });

            return null;
        },
        ...override,
    }
}
