import { bytesToHex } from "@noble/hashes/utils";
import { HashingAlgorithm } from ".";
import { scryptAsync } from '@noble/hashes/scrypt.js';

const SCRYPT_PARAMS = {
  N: 2 ** 14,
  r: 8,
  p: 1,     
  dkLen: 32,
};

export async function hashPassword(password: string, algorithm: HashingAlgorithm = 'argon2', salt = ''): Promise<string | null> {
    switch (algorithm) {
        case 'argon2':
            try {
                const argon2 = await import("argon2");
                return argon2.default.hash(password);
            } catch (error) {
                console.error("[AUTH-KIT-ERROR] Failed to hash password. Have you installed `argon2`?\nError: ", error);
                return null;
            }
        case 'scrypt':
            try {
                const derivedKey = await scryptAsync(
                    new TextEncoder().encode(password),
                    salt,
                    SCRYPT_PARAMS
                );

                return bytesToHex(derivedKey);
            } catch (error) {
                console.error("[AUTH-KIT-ERROR] Failed to hash password with scrypt:", error);
                return null;
            }
    }
}

export async function verifyPassword(password: string, hash: string, algorithm: HashingAlgorithm = 'argon2', salt = ''): Promise<boolean | null> {
    switch (algorithm) {
        case 'argon2':
            try {
                const argon2 = await import("argon2");
                return argon2.default.verify(hash, password);
            } catch (error) {
                console.error("[AUTH-KIT-ERROR] Failed to verify password. Have you installed `argon2`?\nError: ", error);
                return null;
            }
        case 'scrypt':
            try {
                const newHash = await hashPassword(password, 'scrypt', salt);
                return newHash === hash;
            } catch (error) {
                console.error("[AUTH-KIT-ERROR] Failed to verify password with scrypt:", error);
                return null;
            }
    }
}