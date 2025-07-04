export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    try {
        const nodemailer = await import("nodemailer");

        const transporter = nodemailer.createTransport({
            host: process.env.AUTHKIT_SMTP_HOST!,
            port: process.env.AUTHKIT_SMTP_PORT ? parseInt(process.env.AUTHKIT_SMTP_PORT) : 587,
            secure: false,
            auth: {
                user: process.env.AUTHKIT_SMTP_USER!,
                pass: process.env.AUTHKIT_SMTP_PASS!,
            },
        });

        await transporter.sendMail({
            from: process.env.AUTHKIT_EMAIL_FROM!,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error("[AUTH-KIT-ERROR] Error during sending email`?", error);
        console.error("[AUTH-KIT-ERROR] Failed to hash password. Have you installed `nodemailer`?");
        return null;
    }
}
