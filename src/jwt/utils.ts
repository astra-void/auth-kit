import hkdf from "@panva/hkdf";

export async function getEncryptionKey(secret: string, salt: string = '') {
    return await hkdf(
        'sha256',
        secret,
        salt,
        `Generated Encryption Key${salt ? `(${salt})` : ''}`,
        32
    );
}

export function getCookieName(name: string): string {
    if (process.env.NODE_ENV === 'production') {
        return `__Secure-${name}`
    }

    return name;
}