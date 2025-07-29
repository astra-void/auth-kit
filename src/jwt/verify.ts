import { jwtDecrypt, JWTPayload } from "jose";
import { JWTVerifyParams } from "./types";
import { getEncryptionKey } from "./utils";

export async function verifyJWT({
    token,
    secret,
    salt = '', 
}: JWTVerifyParams): Promise<JWTPayload | null> {
    if (!secret) return null;

    try {
        const encryptionKey = await getEncryptionKey(secret, salt);
        const { payload } = await jwtDecrypt(token, encryptionKey, { clockTolerance: 15 });
        return payload; 
    } catch {
        return null;
    }
}