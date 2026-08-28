import type { Ledger } from '@testproof/core';
import { useEffect } from 'react';

import { collectAncestorIds, findFlowLocation, navCollapseKeysForFlow, type NavRow } from './flow-nav-rows';

export function useFlowNavSelection({
    ledger,
    selectedId,
    rows,
    setCollapsedAreaIds,
    setCollapsedFlowIds,
    setCollapsedGroupKeys,
    scrollToFlow,
}: {
    ledger: Ledger;
    selectedId?: string;
    rows: NavRow[];
    setCollapsedAreaIds: (update: (current: Set<string>) => Set<string>) => void;
    setCollapsedFlowIds: (update: (current: Set<string>) => Set<string>) => void;
    setCollapsedGroupKeys?: (update: (current: Set<string>) => Set<string>) => void;
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
        if (setCollapsedGroupKeys) {
            const groupKeys = navCollapseKeysForFlow(ledger, selectedId);
            if (groupKeys.length > 0) {
                setCollapsedGroupKeys((current) => {
                    let changed = false;
                    const next = new Set(current);
                    for (const key of groupKeys) {
                        if (next.has(key)) {
                            next.delete(key);
                            changed = true;
                        }
                    }
                    return changed ? next : current;
                });
            }
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
    }, [ledger, rows, selectedId, scrollToFlow, setCollapsedAreaIds, setCollapsedFlowIds, setCollapsedGroupKeys]);
}
