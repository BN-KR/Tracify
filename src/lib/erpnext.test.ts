import { describe, expect, test } from "vitest";
import { validateErpNextCredentials } from "./erpnext";

describe("ERPNext connector boundary", () => {
  test("accepts an HTTPS site and normalizes its trailing slash", () => {
    expect(validateErpNextCredentials({ baseUrl: "https://erp.example.com/", apiKey: "key", apiSecret: "secret" }).baseUrl).toBe("https://erp.example.com");
  });

  test.each(["http://erp.example.com", "https://localhost:8000", "https://192.168.1.4", "https://erp.example.com/?token=x"])("rejects unsafe base URL %s", (baseUrl) => {
    expect(() => validateErpNextCredentials({ baseUrl, apiKey: "key", apiSecret: "secret" })).toThrow();
  });

  test("requires both token parts", () => {
    expect(() => validateErpNextCredentials({ baseUrl: "https://erp.example.com", apiKey: "", apiSecret: "secret" })).toThrow();
  });
});
