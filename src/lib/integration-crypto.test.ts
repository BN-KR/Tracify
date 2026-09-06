import { describe, expect, test } from "vitest";
import { decryptIntegrationSecret, encryptIntegrationSecret, isEncryptedIntegrationSecret } from "./integration-crypto";

const key = Buffer.alloc(32, 7).toString("base64");

describe("integration secret encryption", () => {
  test("round trips with a versioned AES-GCM envelope", async () => {
    const envelope = await encryptIntegrationSecret("erp-secret", key);
    expect(isEncryptedIntegrationSecret(envelope)).toBe(true);
    expect(envelope).not.toContain("erp-secret");
    expect(await decryptIntegrationSecret(envelope, key)).toBe("erp-secret");
  });

  test("uses a fresh IV for each encryption", async () => {
    const first = await encryptIntegrationSecret("same", key);
    const second = await encryptIntegrationSecret("same", key);
    expect(first).not.toBe(second);
  });

  test("rejects a wrong key and invalid key length", async () => {
    const envelope = await encryptIntegrationSecret("secret", key);
    await expect(decryptIntegrationSecret(envelope, Buffer.alloc(32, 8).toString("base64"))).rejects.toThrow("Unable to decrypt");
    await expect(encryptIntegrationSecret("secret", Buffer.alloc(16).toString("base64"))).rejects.toThrow("32 bytes");
  });
});
