import { applyPatches, openLedgerDocument, parseLedger, serializeLedgerDocument } from '@testproof/core';
import type { Ledger, LedgerPatch } from '@testproof/core';

import { isLedgerConfigError, LedgerConfigError } from '@/lib/ledger-config-error';

interface WorkingLedger {
    afterYaml: string;
    ledger: Ledger;
}

export function loadWorkingLedger(yaml: string, patches: LedgerPatch[]): WorkingLedger {
    try {
        const doc = openLedgerDocument(yaml);
        applyPatches(doc, patches);
        const afterYaml = serializeLedgerDocument(doc);
        return { afterYaml, ledger: parseLedger(afterYaml) };
    } catch (error) {
        if (isLedgerConfigError(error)) throw error;
        const causeMessage = error instanceof Error ? error.message : String(error);
        throw new LedgerConfigError('invalidLedger', { causeMessage });
    }
}
