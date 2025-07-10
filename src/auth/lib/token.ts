import { randomBytes } from "@noble/hashes/utils";

const CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function generateRandomToken(length = 32): string {
  const bytes = randomBytes(length);
  let token = '';
  for (let i = 0; i < bytes.length; i++) {
    token += CHARSET[bytes[i] % CHARSET.length];
  }
  return token;
}