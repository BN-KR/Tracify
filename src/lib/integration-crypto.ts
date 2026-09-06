const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64");
}

function base64ToBytes(value: string) {
  return new Uint8Array(Buffer.from(value, "base64"));
}

function keyBytes(key: string) {
  const bytes = base64ToBytes(key);
  if (bytes.byteLength !== 32) throw new Error("Integration encryption key must decode to 32 bytes");
  return bytes;
}

export async function encryptIntegrationSecret(value: string, base64Key: string) {
  if (!value) throw new Error("Integration secret cannot be empty");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey("raw", keyBytes(base64Key), "AES-GCM", false, ["encrypt"]);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(value));
  return `v1.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(ciphertext))}`;
}

export async function decryptIntegrationSecret(envelope: string, base64Key: string) {
  const [version, ivValue, ciphertextValue] = envelope.split(".");
  if (version !== "v1" || !ivValue || !ciphertextValue) throw new Error("Invalid integration secret envelope");
  const iv = base64ToBytes(ivValue);
  if (iv.byteLength !== 12) throw new Error("Invalid integration secret IV");
  const key = await crypto.subtle.importKey("raw", keyBytes(base64Key), "AES-GCM", false, ["decrypt"]);
  try {
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, base64ToBytes(ciphertextValue));
    return decoder.decode(plaintext);
  } catch {
    throw new Error("Unable to decrypt integration secret");
  }
}

export function isEncryptedIntegrationSecret(value: string) {
  return /^v1\.[A-Za-z0-9+/]+=*\.[A-Za-z0-9+/]+=*$/.test(value);
}
