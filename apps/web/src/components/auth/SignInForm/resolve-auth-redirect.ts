export function resolveAuthRedirectTarget(
    result: { error?: { message?: string } | null; data?: unknown },
    nextPath: string,
): string | null {
    if (result.error) return null;
    if (result.data && typeof result.data === 'object' && 'url' in result.data) {
        const url = (result.data as { url?: unknown }).url;
        if (typeof url === 'string' && url.length > 0) return url;
    }
    return nextPath;
}
