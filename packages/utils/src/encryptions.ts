const subtle = crypto.subtle;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function generateKeyPair() {
  return subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const jwk = await crypto.subtle.exportKey('jwk', key);
  const jwkString = JSON.stringify(jwk);
  const base64 = Buffer.from(jwkString, 'utf-8').toString('base64');
  return base64;
}

export async function importKey(key: string, type: 'public' | 'private'): Promise<CryptoKey> {
  const format = type === 'public' ? 'spki' : 'pkcs8';
  return subtle.importKey(
    format,
    Uint8Array.from(atob(key), (c) => c.charCodeAt(0)),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    type === 'public' ? ['encrypt'] : ['decrypt']
  );
}


export async function fromStringToCrypto(data: string) {
  const key = await subtle.importKey(
    'spki',
    Uint8Array.from(atob(data), (c) => c.charCodeAt(0)),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt']
  );
  return key;
}


export async function encryptionData(pubKey: string, content: string): Promise<string> {
  const data = encoder.encode(content);
  const key = await fromStringToCrypto(pubKey);
  const encrypted = await subtle.encrypt({ name: 'RSA-OAEP' }, key, data);
  return Buffer.from(encrypted).toString('base64');
}

export async function decryptionData(privKey: string, content: string): Promise<string> {
  const data = Buffer.from(content, 'base64');
  const key = await fromStringToCrypto(privKey);
  const decrypted = await subtle.decrypt({ name: 'RSA-OAEP' }, key, data);
  return decoder.decode(decrypted);
}
