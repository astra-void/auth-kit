import { sha1 } from '@noble/hashes/sha1';
import { utf8ToBytes } from '@noble/hashes/utils';
import { hmac } from '@noble/hashes/hmac';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function bytesToBase32(bytes: Uint8Array): string {
  let bits = '';
  for (const byte of bytes) bits += byte.toString(2).padStart(8, '0');

  let base32 = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    base32 += BASE32_ALPHABET[parseInt(chunk, 2)];
  }
  return base32;
}

function base32ToBytes(base32: string): Uint8Array {
  const cleaned = base32.replace(/=+$/, '').toUpperCase();
  let bits = '';
  for (const char of cleaned) {
    const val = BASE32_ALPHABET.indexOf(char);
    if (val === -1) throw new Error(`Invalid base32 char: ${char}`);
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

export function deriveTotpSecret(userId: string, masterSecret: string): string {
  const data = utf8ToBytes(userId + ':' + masterSecret);
  const hash = sha1(data);
  return bytesToBase32(hash);
}

function intToUint8Array(num: number): Uint8Array {
  const arr = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    arr[i] = num & 0xff;
    num = num >> 8;
  }
  return arr;
}

export function generateTOTP(secret: string, window = 0): string {
  const key = base32ToBytes(secret);
  const timeStep = 30;
  const counter = Math.floor(Date.now() / 1000 / timeStep) + window;
  const counterBytes = intToUint8Array(counter);

  const digest = hmac(sha1, key, counterBytes);
  const offset = digest[digest.length - 1] & 0x0f;
  const code = ((digest[offset] & 0x7f) << 24) |
               ((digest[offset + 1] & 0xff) << 16) |
               ((digest[offset + 2] & 0xff) << 8) |
               (digest[offset + 3] & 0xff);

  const otp = code % 10 ** 6;
  return otp.toString().padStart(6, '0');
}

export function generateOtpAuthUrl(userId: string, issuer: string, secret: string): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(userId)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

export function verifyTOTP(token: string, secret: string, windowRange = 1): boolean {
  for (let offset = -windowRange; offset <= windowRange; offset++) {
    const expected = generateTOTP(secret, offset);
    if (token === expected) return true;
  }
  return false;
}