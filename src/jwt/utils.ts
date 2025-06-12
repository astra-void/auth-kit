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
