import { HashingAlgorithm } from ".";

export async function hashPassword(password: string, algorithm: HashingAlgorithm = 'argon2'): Promise<string | null> {
    switch (algorithm) {
        case 'bcrypt':
            try {
                const bcrypt = await import("bcrypt");
                return bcrypt.default.hash(password, 10);
            } catch {
                console.error("[AUTH-KIT-ERROR] Failed to hash password. Have you installed `bcrypt`?");
                return null;
            }
        case 'argon2':
            try {
                const argon2 = await import("argon2");
                return argon2.default.hash(password);
            } catch (error) {
                console.error("[AUTH-KIT-ERROR] Failed to hash password. Have you installed `argon2`?", error);
                return null;
            }
    }
}

export async function verifyPassword(password: string, hash: string, algorithm: HashingAlgorithm = 'argon2'): Promise<boolean | null> {
    switch (algorithm) {
        case 'bcrypt':
            try {
                const bcrypt = await import("bcrypt");
                return bcrypt.default.compare(password, hash);
            } catch {
                console.error("[AUTH-KIT-ERROR] Failed to hash password. Have you installed `bcrypt`?");
                return null;
            }
        case 'argon2':
            try {
                const argon2 = await import("argon2");
                return argon2.default.verify(hash, password);
            } catch {
                console.error("[AUTH-KIT-ERROR] Failed to hash password. Have you installed `argon2`?");
                return null;
            }
    }
}
