const MAX_TEXT = 2_000;

export type ErpNextCredentials = {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
};

export type ErpNextTodoPayload = {
  description: string;
  priority?: "Low" | "Medium" | "High";
  status?: "Open" | "Closed";
  date?: string;
  reference_type?: string;
  reference_name?: string;
};

function parseBaseUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("ERPNext base URL must be a valid HTTPS URL");
  }

  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("ERPNext base URL must be HTTPS and must not contain credentials or query parameters");
  }

  const hostname = url.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "[::1]" ||
    hostname === "::1" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
    hostname.endsWith(".local")
  ) {
    throw new Error("ERPNext base URL must not target a private or local network");
  }

  url.pathname = url.pathname.replace(/\/+$/, "");
  return url;
}

export function validateErpNextCredentials(credentials: ErpNextCredentials) {
  const baseUrl = parseBaseUrl(credentials.baseUrl).toString().replace(/\/$/, "");
  if (!credentials.apiKey.trim() || !credentials.apiSecret.trim()) {
    throw new Error("ERPNext API key and secret are required");
  }
  return { ...credentials, baseUrl };
}

function endpoint(baseUrl: string, path: string) {
  const base = parseBaseUrl(baseUrl);
  return new URL(path, `${base.toString().replace(/\/$/, "")}/`).toString();
}

function authHeader(credentials: ErpNextCredentials) {
  return `token ${credentials.apiKey}:${credentials.apiSecret}`;
}

async function request(credentials: ErpNextCredentials, path: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(endpoint(credentials.baseUrl, path), {
      ...init,
      redirect: "error",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        Authorization: authHeader(credentials),
        ...init.headers,
      },
    });
    if (!response.ok) {
      throw new Error(`ERPNext request failed with HTTP ${response.status}`);
    }
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function testErpNextConnection(credentials: ErpNextCredentials) {
  const safe = validateErpNextCredentials(credentials);
  const response = await request(safe, "/api/method/frappe.auth.get_logged_user");
  const body = await response.json() as { message?: unknown };
  return typeof body.message === "string" ? body.message : "connected";
}

export async function createErpNextTodo(credentials: ErpNextCredentials, payload: ErpNextTodoPayload) {
  const safe = validateErpNextCredentials(credentials);
  const bounded = Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, typeof value === "string" ? value.slice(0, MAX_TEXT) : value]),
  );
  const response = await request(safe, "/api/resource/ToDo", {
    method: "POST",
    body: JSON.stringify(bounded),
  });
  const body = await response.json() as { data?: { name?: string } };
  return body.data?.name ?? null;
}
