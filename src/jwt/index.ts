import hkdf from "@panva/hkdf";
import { v4 as uuid } from "uuid";
import { EncryptJWT, jwtDecrypt, JWTPayload } from "jose";
import { JWTDecryptParams, JWTEncryptParams } from "./types";

export * from "./types";

const DEFAULT_MAX_AGE = 60 * 60;

const now = () => Math.floor(Date.now() / 1000);

async function getEncryptionKey(secret: string, salt: string = '') {
    return await hkdf(
        'sha256',
        secret,
        salt,
        `Generated Encryption Key${salt ? `(${salt})` : ''}`,
        32
    );
}

export async function encryptJWT(params: JWTEncryptParams): Promise<string> {
    const { payload, secret, options } = params;
    const maxAge = options?.maxAge ?? DEFAULT_MAX_AGE;
    const salt = options?.salt ?? '';
    const encryptionKey = await getEncryptionKey(secret, salt);

    return await new EncryptJWT(payload)
        .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
        .setIssuedAt()
        .setExpirationTime(now() + maxAge)
        .setJti(uuid())
        .encrypt(encryptionKey)
}

export async function decryptJWT(params: JWTDecryptParams): Promise<JWTPayload | null> {
    const { token, secret, salt = '' } = params;
    if (!token && secret) {
        return null;
    }

    const encryptionKey = await getEncryptionKey(secret, salt);
    const { payload } = await jwtDecrypt(token, encryptionKey, { clockTolerance: 15 });

    return payload;
}
