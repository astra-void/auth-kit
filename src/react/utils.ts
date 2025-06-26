import axios from "axios";

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

    const res = await axios.request({
      url,
      method,
      data,
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      withCredentials: true,
    });

    return { data: res.data, status: res.status };
  } catch {
    return null;
  }
}
