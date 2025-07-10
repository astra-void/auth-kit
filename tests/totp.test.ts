import { deriveTotpSecret, generateTOTP, verifyTOTP } from "../src/auth/lib/totp";

describe("TOTP", () => {
    test("should generate correct secret", () => {
        const userId = 'ad4dcc71-5eea-4978-9419-7a3bb465c56a';
        const masterSecret = "secret";

        const totpSecret = deriveTotpSecret(userId, masterSecret);
        const generatedOTP = generateTOTP(totpSecret);

        expect(totpSecret).toBe("P6CWMMJGC3AJXTTQYZJOQOD76NYJZUL6");
        expect(verifyTOTP(generatedOTP, totpSecret)).toBe(true);
    })
})