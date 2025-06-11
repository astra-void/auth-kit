import { JWTPayload } from "jose";
import { decryptJWT, encryptJWT, Secret } from "../jwt";

export async function login(payload: JWTPayload, secret: Secret) {
    const token = await encryptJWT({ payload, secret });
    const userId = await decryptJWT({ token, secret }).then((res) => res?.userId);
    return { token, userId };
}