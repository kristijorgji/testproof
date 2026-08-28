'use client';

import { openLedgerDocument, serializeLedgerDocument } from '@testproof/core/document';
import { parseLedger } from '@testproof/core/parse';
import { applyPatches, type LedgerPatch } from '@testproof/core/patch';
import type { Ledger } from '@testproof/core/schema';
import { useEffect, useRef, useState, useTransition } from 'react';

export function useWorkingLedger({
    serverLedger,
    serverAfterYaml,
    onPatch,
}: {
    serverLedger: Ledger;
    serverAfterYaml: string;
    onPatch: (patch: LedgerPatch) => Promise<void>;
}): {
    ledger: Ledger;
    afterYaml: string;
    apply: (patch: LedgerPatch) => void;
    pendingCount: number;
} {
    const [ledger, setLedger] = useState(serverLedger);
    const [afterYaml, setAfterYaml] = useState(serverAfterYaml);
    const [pendingCount, setPendingCount] = useState(0);
    const localQueueRef = useRef(0);
    const [, start] = useTransition();

    useEffect(() => {
        if (localQueueRef.current > 0) return;
        setLedger(serverLedger);
        setAfterYaml(serverAfterYaml);
    }, [serverLedger, serverAfterYaml]);

    const apply = (patch: LedgerPatch): void => {
        localQueueRef.current += 1;
        setPendingCount(localQueueRef.current);
        try {
            const doc = openLedgerDocument(afterYaml);
            applyPatches(doc, [patch]);
            const nextYaml = serializeLedgerDocument(doc);
            setAfterYaml(nextYaml);
            setLedger(parseLedger(nextYaml));
        } catch {
            localQueueRef.current = Math.max(0, localQueueRef.current - 1);
            setPendingCount(localQueueRef.current);
            return;
        }
        start(() => {
            void onPatch(patch).finally(() => {
                localQueueRef.current = Math.max(0, localQueueRef.current - 1);
                setPendingCount(localQueueRef.current);
            });
        });
    };

    return { ledger, afterYaml, apply, pendingCount };
}
