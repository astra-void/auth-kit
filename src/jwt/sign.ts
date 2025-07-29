import { EncryptJWT } from "jose";
import { v4 as uuid } from "uuid";
import { JWTSignParams } from "./types";
import { getEncryptionKey } from "./utils";

const now = () => Math.floor(Date.now() / 1000);

export async function signJWT({
    payload,
    secret,
    options
}: JWTSignParams) {
    const maxAge = options?.maxAge ?? 3600;
    const salt = options?.salt ?? '';

    if (!secret) return;

    const encryptionKey = await getEncryptionKey(secret, salt);

    return await new EncryptJWT(payload)
        .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
        .setIssuedAt()
        .setExpirationTime(now() + maxAge)
        .setJti(uuid())
        .encrypt(encryptionKey);
}