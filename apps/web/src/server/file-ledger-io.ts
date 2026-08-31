import fs from 'node:fs';
import path from 'node:path';

import { LedgerConfigError } from '@/lib/ledger-config-error';

type FileIoOp = 'read' | 'write';

function nodeErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object' && 'code' in error) {
        return String(error.code);
    }
    return undefined;
}

export function mapFileIoToLedgerConfigError(error: unknown, filePath: string, op: FileIoOp): never {
    const code = nodeErrorCode(error);
    const causeMessage = error instanceof Error ? error.message : String(error);
    if (code === 'ENOENT') {
        throw new LedgerConfigError('fileMissing', { path: filePath, causeMessage });
    }
    if (op === 'read' && (code === 'EACCES' || code === 'EPERM')) {
        throw new LedgerConfigError('fileNotReadable', { path: filePath, causeMessage });
    }
    if (op === 'write' && (code === 'EACCES' || code === 'EPERM' || code === 'EROFS')) {
        throw new LedgerConfigError('fileNotWritable', { path: filePath, causeMessage });
    }
    throw error;
}

export function readLedgerFileSync(filePath: string): string {
    try {
        return fs.readFileSync(/* turbopackIgnore: true */ filePath, 'utf8');
    } catch (error) {
        mapFileIoToLedgerConfigError(error, filePath, 'read');
    }
}

export function writeLedgerFileSync(filePath: string, yaml: string): void {
    try {
        fs.mkdirSync(/* turbopackIgnore: true */ path.dirname(filePath), { recursive: true });
        fs.writeFileSync(/* turbopackIgnore: true */ filePath, yaml);
    } catch (error) {
        mapFileIoToLedgerConfigError(error, filePath, 'write');
    }
}
