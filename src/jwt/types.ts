import { JWTPayload } from "jose";

export interface JWTSignParams {
    payload: JWTPayload;
    secret?: Secret;
    options?: {
        salt?: string;
        maxAge?: number;
    };
}

export interface JWTVerifyParams {
    token: string;
    secret?: Secret;
    salt?: string;
}

export type Secret = string;