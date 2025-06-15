export function getCookieName(name: string): string {
    if (process.env.NODE_ENV === 'production') {
        return `__Secure-${name}`
    }

    return name;
}