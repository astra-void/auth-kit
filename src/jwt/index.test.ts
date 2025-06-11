import { decryptJWT, encryptJWT } from ".";

const secret = "super-secret";

describe('jwt', () => {
    it('signs and verifies token correctly', async () => {
        const payload = { email: "test@example.com" };
        const token = await encryptJWT({ payload, secret });

        const verified = await decryptJWT({ token, secret });
        expect(verified?.email).toBe("test@example.com");
    });
});