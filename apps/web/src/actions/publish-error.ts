import { isLedgerConfigError } from '@/lib/ledger-config-error';

export function publishErrorCode(error: unknown): string {
    if (isLedgerConfigError(error)) {
        if (error.code === 'fileMissing') return 'fileMissing';
        if (error.code === 'fileNotReadable' || error.code === 'fileNotWritable') return 'fileNotWritable';
        return 'publishFailed';
    }
    if (error && typeof error === 'object' && 'code' in error) {
        const code = String(error.code);
        if (code === 'ENOENT') return 'fileMissing';
        if (code === 'EACCES' || code === 'EPERM' || code === 'EROFS') return 'fileNotWritable';
    }
    return 'publishFailed';
}
