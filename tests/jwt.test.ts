import { signJWT, verifyJWT } from "../src/jwt";

const secret = "super-secret";

describe('jwt', () => {
    it('signs and verifies token correctly', async () => {
        const payload = { email: "test@example.com" };
        const token = await signJWT({ payload, secret });
        let verified;
        if (typeof token === 'string') {
            verified = await verifyJWT({ token, secret });
        }
        expect(verified?.email).toBe("test@example.com");
    });
});