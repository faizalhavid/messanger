import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';

/**
 * Generate 256-bit (32 bytes) hex key
 */
export async function generateKey(): Promise<string> {
  const keyBytes = await Crypto.getRandomBytesAsync(32); // 256-bit
  return Buffer.from(keyBytes).toString('hex');
}

/**
 * Encrypt content using AES with random IV
 */
export async function encryptionData(secretKey: string, content: string): Promise<string> {
  const ivBytes = await Crypto.getRandomBytesAsync(16); // 128-bit IV
  const iv = CryptoJS.enc.Hex.parse(Buffer.from(ivBytes).toString('hex'));
  const key = CryptoJS.enc.Hex.parse(secretKey);

  const encrypted = CryptoJS.AES.encrypt(content, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  console.log("vvvv", iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.toString());
  return iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.toString();
}

/**
 * Decrypt AES using known key and IV
 */
export function decryptionData(secretKey: string, encryptedData: string): string {
  const [ivHex, cipherText] = encryptedData.split(':');
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const key = CryptoJS.enc.Hex.parse(secretKey);

  const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}
