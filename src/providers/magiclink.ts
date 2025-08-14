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
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Sign in to your account</title>
                        <style>
                            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                            .container { background-color: #fafafa; padding: 60px 20px; }
                            .email-card { background-color: #ffffff; max-width: 420px; margin: 0 auto; border-radius: 8px; border: 1px solid #e4e4e7; }
                            .header { padding: 60px 40px 40px; text-align: center; }
                            .title { font-size: 24px; font-weight: 500; margin: 0 0 12px; color: #18181b; }
                            .subtitle { font-size: 15px; color: #52525b; margin: 0; line-height: 1.5; }
                            .content { padding: 0 40px 60px; }
                            .button-container { text-align: center; margin: 40px 0; }
                            .magic-button { 
                                display: inline-block; 
                                background-color: #18181b; 
                                color: #ffffff; 
                                text-decoration: none; 
                                padding: 16px 40px; 
                                border-radius: 6px; 
                                font-weight: 500; 
                                font-size: 15px;
                                transition: background-color 0.2s;
                            }
                            .magic-button:hover { background-color: #27272a; }
                            .link-box { 
                                background-color: #fafafa; 
                                border: 1px solid #e4e4e7; 
                                border-radius: 6px; 
                                padding: 20px; 
                                margin: 32px 0; 
                            }
                            .link-label { font-size: 13px; color: #52525b; margin: 0 0 8px; }
                            .link-url { 
                                font-size: 12px; 
                                color: #374151; 
                                word-break: break-all; 
                                font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
                                line-height: 1.4;
                            }
                            .expires { font-size: 13px; color: #71717a; margin: 32px 0 0; text-align: center; }
                            .footer { 
                                background-color: #fafafa; 
                                padding: 24px 40px; 
                                border-top: 1px solid #e4e4e7; 
                                text-align: center; 
                            }
                            .footer-text { font-size: 12px; color: #71717a; margin: 0; }

                            @media (prefers-color-scheme: dark) {
                                .container { background-color: #09090b !important; }
                                .email-card { 
                                    background-color: #18181b !important; 
                                    border-color: #27272a !important; 
                                }
                                .title { color: #fafafa !important; }
                                .subtitle { color: #a1a1aa !important; }
                                .link-box { 
                                    background-color: #27272a !important; 
                                    border-color: #3f3f46 !important; 
                                }
                                .link-label { color: #a1a1aa !important; }
                                .link-url { color: #d4d4d8 !important; }
                                .expires { color: #71717a !important; }
                                .footer { 
                                    background-color: #27272a !important; 
                                    border-color: #3f3f46 !important; 
                                }
                                .footer-text { color: #71717a !important; }
                                .magic-button { 
                                    background-color: #fafafa !important; 
                                    color: #18181b !important; 
                                }
                                .magic-button:hover { background-color: #e4e4e7 !important; }
                            }
                                
                            [data-ogsc] .container { background-color: #09090b !important; }
                            [data-ogsc] .email-card { 
                                background-color: #18181b !important; 
                                border-color: #27272a !important; 
                            }
                            [data-ogsc] .title { color: #fafafa !important; }
                            [data-ogsc] .subtitle { color: #a1a1aa !important; }
                            [data-ogsc] .magic-button { 
                                background-color: #fafafa !important; 
                                color: #18181b !important; 
                            }
                            
                            @media only screen and (max-width: 480px) {
                                .container { padding: 40px 16px; }
                                .header { padding: 40px 24px 24px; }
                                .content { padding: 0 24px 40px; }
                                .footer { padding: 20px 24px; }
                                .title { font-size: 20px; }
                                .magic-button { padding: 14px 32px; font-size: 14px; }
                            }
                        </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="email-card">
                                <div class="header">
                                    <h1 class="title">Sign in to your account</h1>
                                    <p class="subtitle">Click the button below to sign in securely</p>
                                </div>
                                
                                <div class="content">
                                    <div class="button-container">
                                    <a href="${callbackUrl}" class="magic-button">Sign in</a>
                                    </div>
                                    
                                    <div class="link-box">
                                    <p class="link-label">Or copy this link:</p>
                                    <div class="link-url">${callbackUrl}</div>
                                    </div>
                                    
                                    <p class="expires">Link expires in 15 minutes</p>
                                </div>
                                
                                <div class="footer">
                                    <p class="footer-text">Sent to ${user.email} • Ignore if you didn't request this</p>
                                </div>
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
