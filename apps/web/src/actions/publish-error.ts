export function publishErrorCode(error: unknown): string {
    if (error && typeof error === 'object' && 'code' in error) {
        const code = String(error.code);
        if (code === 'ENOENT') return 'fileMissing';
        if (code === 'EACCES' || code === 'EPERM' || code === 'EROFS') return 'fileNotWritable';
    }
    return 'publishFailed';
}
