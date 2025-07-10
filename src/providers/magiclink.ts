import { generateRandomToken } from "../auth/lib/token";
import { getGlobalConfig } from "../core";
import { sendEmail } from "../core/lib";
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

            const token = generateRandomToken();

            await adapter.createMagicLinkToken?.(email, token, new Date(Date.now() + 1000 * 60 * 15));

            const callbackUrl = `${process.env.AUTHKIT_ORIGIN}/api/auth/callback?token=${token}`;

            await sendEmail({
                to: user.email!,
                subject: 'Your Magic Sign-In Link (15 min valid)',
                html: `
                    <!DOCTYPE html>
                    <html lang="en">
                        <head>
                        <meta charset="UTF-8" />
                        <title>Magic Login Link</title>
                        <style>
                            body {
                            background-color: #f4f4f5;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                            margin: 0;
                            padding: 40px 16px;
                            color: #0f172a;
                            }
                            .container {
                            background-color: #ffffff;
                            max-width: 480px;
                            margin: 0 auto;
                            padding: 32px;
                            border-radius: 12px;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
                            }
                            h1 {
                            font-size: 20px;
                            margin-bottom: 16px;
                            color: #1e293b;
                            }
                            p {
                            font-size: 15px;
                            margin-bottom: 20px;
                            line-height: 1.6;
                            }
                            a.button {
                            display: inline-block;
                            background-color: #2563eb;
                            color: #ffffff !important;
                            text-decoration: none;
                            padding: 14px 24px;
                            border-radius: 8px;
                            font-weight: 600;
                            font-size: 15px;
                            margin: 16px 0;
                            }
                            .link-raw {
                            font-size: 13px;
                            background-color: #f1f5f9;
                            padding: 10px;
                            border-radius: 6px;
                            word-break: break-all;
                            color: #334155;
                            }
                            .footer {
                            font-size: 12px;
                            color: #64748b;
                            margin-top: 24px;
                            border-top: 1px solid #e2e8f0;
                            padding-top: 16px;
                            }
                        </style>
                        </head>
                        <body>
                        <div class="container">
                            <h1>🔐 Sign in to Your Account</h1>
                            <p>
                            Click the button below to sign in. This link will expire in 15 minutes for your security.
                            </p>
                            <a href="${callbackUrl}" class="button">Sign In</a>
                            <p>If the button above doesn't work, copy and paste the URL below into your browser:</p>
                            <div class="link-raw">${callbackUrl}</div>
                            <div class="footer">
                            If you did not request this email, you can safely ignore it.
                            </div>
                        </div>
                        </body>
                    </html>
                `,
            });

            return null;
        },
        ...override,
    }
}
