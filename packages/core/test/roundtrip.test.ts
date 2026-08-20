import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { openLedgerDocument, serializeLedgerDocument } from '../src/document.js';
import { applyPatch } from '../src/patch.js';

const FIXTURE = join(dirname(fileURLToPath(import.meta.url)), 'fixtures/flows.yaml');

function changedLines(from: string, to: string): string[] {
    const a = from.split('\n');
    const b = to.split('\n');
    const out: string[] = [];
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i += 1) {
        if (a[i] !== b[i]) {
            if (a[i] !== undefined) out.push(`-${a[i]}`);
            if (b[i] !== undefined) out.push(`+${b[i]}`);
        }
    }
    return out;
}

describe('YAML round-trip', () => {
    it('serializes a no-op document to a close copy of the fixture', () => {
        const source = readFileSync(FIXTURE, 'utf8');
        const doc = openLedgerDocument(source);
        const out = serializeLedgerDocument(doc);
        expect(out.includes('FLOW-AUTH-LOGIN-INVALID')).toBe(true);
        expect(out.includes('notes: |') || out.includes('notes:|')).toBe(true);
        const changed = changedLines(source, out);
        expect(changed.length).toBeLessThan(30);
    });

    it('edits one flow title with a one-line diff against the serialized baseline', () => {
        const source = readFileSync(FIXTURE, 'utf8');
        const baselineDoc = openLedgerDocument(source);
        const baseline = serializeLedgerDocument(baselineDoc);
        const doc = openLedgerDocument(source);
        applyPatch(doc, { op: 'set-flow-field', flowId: 'FLOW-AUTH-LOGIN-INVALID', field: 'title', value: 'X' });
        const out = serializeLedgerDocument(doc);
        const changed = changedLines(baseline, out);
        expect(changed.some((line) => line.includes('X'))).toBe(true);
        expect(changed.filter((line) => line.startsWith('+') || line.startsWith('-')).length).toBeLessThanOrEqual(4);
        expect(out.includes('Invalid credentials')).toBe(false);
    });
});
