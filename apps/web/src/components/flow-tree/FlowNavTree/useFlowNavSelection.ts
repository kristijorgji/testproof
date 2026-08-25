import type { Ledger } from '@testproof/core';
import { useEffect } from 'react';

import { collectAncestorIds, findFlowLocation, type NavRow } from './flow-nav-rows';

export function useFlowNavSelection({
    ledger,
    selectedId,
    rows,
    setCollapsedAreaIds,
    setCollapsedFlowIds,
    scrollToFlow,
}: {
    ledger: Ledger;
    selectedId?: string;
    rows: NavRow[];
    setCollapsedAreaIds: (update: (current: Set<string>) => Set<string>) => void;
    setCollapsedFlowIds: (update: (current: Set<string>) => Set<string>) => void;
    scrollToFlow: (index: number, flowId: string) => void;
}): void {
    useEffect(() => {
        if (!selectedId) return;
        const location = findFlowLocation(ledger, selectedId);
        const ancestors = collectAncestorIds(ledger, selectedId);
        if (location) {
            setCollapsedAreaIds((current) => {
                if (!current.has(location.areaId)) return current;
                const next = new Set(current);
                next.delete(location.areaId);
                return next;
            });
        }
        if (ancestors.length > 0) {
            setCollapsedFlowIds((current) => {
                let changed = false;
                const next = new Set(current);
                for (const id of ancestors) {
                    if (next.has(id)) {
                        next.delete(id);
                        changed = true;
                    }
                }
                return changed ? next : current;
            });
        }
        const index = rows.findIndex((row) => row.kind === 'flow' && row.id === selectedId);
        if (index >= 0) scrollToFlow(index, selectedId);
    }, [ledger, rows, selectedId, scrollToFlow, setCollapsedAreaIds, setCollapsedFlowIds]);
}
