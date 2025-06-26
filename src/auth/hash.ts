import { HashingAlgorithm } from ".";

let argon2: typeof import("argon2") | null = null;
let bcrypt: typeof import("bcrypt") | null = null;

export async function hashPassword(password: string, algorithm: HashingAlgorithm = 'argon2'): Promise<string | null> {
    switch (algorithm) {
        case 'bcrypt':
            try {
                const mod = await import("bcrypt");
                bcrypt = mod;
                return bcrypt.hash(password, 10);
            } catch {
                console.error("[AUTH-KIT-ERROR] Failed to hash password. Have you installed `bcrypt`?");
                return null;
            }
        case 'argon2':
            try {
                const mod = await import("argon2");
                argon2 = mod;
                return argon2.hash(password);
            } catch {
                console.error("[AUTH-KIT-ERROR] Failed to hash password. Have you installed `argon2`?");
                return null;
            }
    }
}

export async function verifyPassword(password: string, hash: string, algorithm: HashingAlgorithm = 'argon2'): Promise<boolean | null> {
    switch (algorithm) {
        case 'bcrypt':
            try {
                const mod = await import("bcrypt");
                bcrypt = mod;
                return bcrypt.compare(password, hash);
            } catch {
                console.error("[AUTH-KIT-ERROR] Failed to hash password. Have you installed `bcrypt`?");
                return null;
            }
        case 'argon2':
            try {
                const mod = await import("argon2");
                argon2 = mod;
                return argon2.verify(hash, password);
            } catch {
                console.error("[AUTH-KIT-ERROR] Failed to hash password. Have you installed `argon2`?");
                return null;
            }
    }
}
