import { JWTPayload } from "jose";

export interface JWTEncryptParams {
    payload: JWTPayload;
    secret: Secret;
    options?: {
        salt?: string;
        maxAge?: number;
    };
}

export interface JWTDecryptParams {
    token: string;
    secret: Secret;
    salt?: string;
}

export type Secret = string;