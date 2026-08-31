import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { mapFileIoToLedgerConfigError, readLedgerFileSync, writeLedgerFileSync } from './file-ledger-io';

import { isLedgerConfigError } from '@/lib/ledger-config-error';

function expectLedgerConfigCode(fn: () => void, code: string, filePath?: string): void {
    try {
        fn();
        expect.fail('expected LedgerConfigError');
    } catch (error) {
        expect(isLedgerConfigError(error)).toBe(true);
        if (isLedgerConfigError(error)) {
            expect(error.code).toBe(code);
            if (filePath !== undefined) expect(error.path).toBe(filePath);
        }
    }
}

describe('mapFileIoToLedgerConfigError', () => {
    it('maps ENOENT to fileMissing', () => {
        expectLedgerConfigCode(
            () => mapFileIoToLedgerConfigError({ code: 'ENOENT', message: 'missing' }, '/data/flows.yaml', 'read'),
            'fileMissing',
            '/data/flows.yaml',
        );
    });

    it('maps read permission errors to fileNotReadable', () => {
        expectLedgerConfigCode(
            () => mapFileIoToLedgerConfigError({ code: 'EACCES' }, '/data/flows.yaml', 'read'),
            'fileNotReadable',
            '/data/flows.yaml',
        );
    });

    it('maps write permission errors to fileNotWritable', () => {
        expectLedgerConfigCode(
            () => mapFileIoToLedgerConfigError({ code: 'EROFS' }, '/data/flows.yaml', 'write'),
            'fileNotWritable',
            '/data/flows.yaml',
        );
    });

    it('rethrows unknown errors', () => {
        const boom = new Error('disk failure');
        expect(() => mapFileIoToLedgerConfigError(boom, '/data/flows.yaml', 'read')).toThrow(boom);
    });
});

describe('readLedgerFileSync', () => {
    it('throws fileMissing when the path does not exist', () => {
        const missing = path.join(os.tmpdir(), `testproof-missing-${Date.now()}.yaml`);
        expectLedgerConfigCode(() => readLedgerFileSync(missing), 'fileMissing', missing);
    });

    it('throws fileNotReadable when the file cannot be read', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'testproof-ledger-'));
        const filePath = path.join(dir, 'flows.yaml');
        fs.writeFileSync(filePath, 'version: 2\n');
        fs.chmodSync(filePath, 0);
        try {
            try {
                fs.accessSync(filePath, fs.constants.R_OK);
                return;
            } catch {
                // unreadable as intended
            }
            expectLedgerConfigCode(() => readLedgerFileSync(filePath), 'fileNotReadable', filePath);
        } finally {
            fs.chmodSync(filePath, 0o644);
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
});

describe('writeLedgerFileSync', () => {
    it('writes yaml to a new path', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'testproof-ledger-'));
        const filePath = path.join(dir, 'nested', 'flows.yaml');
        try {
            writeLedgerFileSync(filePath, 'version: 2\n');
            expect(fs.readFileSync(filePath, 'utf8')).toBe('version: 2\n');
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
});
