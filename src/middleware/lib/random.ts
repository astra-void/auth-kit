export async function getSecureRandomBytes(len = 32): Promise<Uint8Array> {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    return globalThis.crypto.getRandomValues(new Uint8Array(len));
  }

  try {
    const { randomFillSync } = (await import('crypto')).default;
    const buf = new Uint8Array(len);
    randomFillSync(buf);
    return buf;
  } catch {
    throw new Error('No secure random source available for CSRF token generation');
  }
}
