export function getCsrfTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;

    const possibleNames = ['auth-kit.csrf_token', '__Secure-auth-kit.csrf_token'];

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