import RNSimpleCrypto from 'react-native-simple-crypto';

const { RSA } = RNSimpleCrypto;

export async function generateKeyPair() {
  const keys = await RSA.generateKeys(2048);
  return {
    publicKey: keys.public,
    privateKey: keys.private,
  };
}

export async function encryptionData(pubKey: string, content: string): Promise<string> {
  return await RSA.encrypt(content, pubKey); // base64
}

export async function decryptionData(privKey: string, content: string): Promise<string> {
  return await RSA.decrypt(content, privKey); // string
}
