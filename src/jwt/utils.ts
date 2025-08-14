import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2';

export async function getEncryptionKey(secret: string, salt: string = '') {
    return hkdf(
        sha256,
        secret,
        salt,
        `Generated Encryption Key${salt ? `(${salt})` : ''}`,
        32
    );
}
