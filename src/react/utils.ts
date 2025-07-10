export function getCsrfTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;

    const possibleNames = ['auth-kit.csrf-token', '__Secure-auth-kit.csrf-token'];

    for (const name of possibleNames) {
        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(name + '='));
        if (cookie) {
            return decodeURIComponent(cookie.split('=')[1]);
        }
    }

    return null;
}

export async function authRequest<T>(
  method: "POST" | "GET" | "PUT" | "DELETE",
  url: string,
  data?: object
): Promise<{ data: T, status: number } | null> {
  try {
    const csrfToken = getCsrfTokenFromCookie();
    if (!csrfToken) {
      throw new Error("CSRF token not found.");
    }

    const headers: Record<string, string> = {
      "X-CSRF-Token": csrfToken,
    };

    let body: string | undefined = undefined;
    if (data) {
      body = JSON.stringify(data);
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(url, {
      method,
      headers,
      body,
      credentials: "include",
    });

    if (!res.ok) return null;

    const responseData = (await res.json()) as T;

    return { data: responseData, status: res.status };
  } catch {
    return null;
  }
}
