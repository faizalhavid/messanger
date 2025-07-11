import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';
import CryptoJS from 'crypto-js';

/**
 * Generate 256-bit (32 bytes) random key
 */
export async function generateKey(): Promise<string> {
  const keyBytes = await Random.getRandomBytesAsync(32);
  return Buffer.from(keyBytes).toString('hex'); // or base64
}

/**
 * Encrypt using AES
 */
export function encryptionData(secretKey: string, content: string): string {
  const encrypted = CryptoJS.AES.encrypt(content, secretKey).toString();
  return encrypted;
}

/**
 * Decrypt AES
 */
export function decryptionData(secretKey: string, encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}
