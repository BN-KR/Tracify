/** Reads a response body as JSON; an empty or non-JSON body (a platform error page, a dropped connection) becomes `{}`. */
export async function readJson<T extends object>(response: Response): Promise<T & { error?: string }> {
  try {
    return (await response.json()) as T & { error?: string };
  } catch {
    return {} as T & { error?: string };
  }
}
