import type { Ledger } from '@testproof/core';
import { useEffect, useRef } from 'react';

import { collectAncestorIds, findFlowLocation, navCollapseKeysForFlow, type NavRow } from './flow-nav-rows';

function expandAncestorsForSelection({
    ledger,
    selectedId,
    setCollapsedAreaIds,
    setCollapsedFlowIds,
    setCollapsedGroupKeys,
}: {
    ledger: Ledger;
    selectedId: string;
    setCollapsedAreaIds: (update: (current: Set<string>) => Set<string>) => void;
    setCollapsedFlowIds: (update: (current: Set<string>) => Set<string>) => void;
    setCollapsedGroupKeys?: (update: (current: Set<string>) => Set<string>) => void;
}): void {
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
}

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
    const prevSelectedIdRef = useRef<string | undefined>(undefined);
    const needsScrollRef = useRef(false);

    useEffect(() => {
        if (!selectedId) {
            prevSelectedIdRef.current = undefined;
            needsScrollRef.current = false;
            return;
        }

        if (prevSelectedIdRef.current !== selectedId) {
            prevSelectedIdRef.current = selectedId;
            needsScrollRef.current = true;
            expandAncestorsForSelection({
                ledger,
                selectedId,
                setCollapsedAreaIds,
                setCollapsedFlowIds,
                setCollapsedGroupKeys,
            });
        }

        if (!needsScrollRef.current) return;
        const index = rows.findIndex((row) => row.kind === 'flow' && row.id === selectedId);
        if (index < 0) return;
        scrollToFlow(index, selectedId);
        needsScrollRef.current = false;
    }, [ledger, rows, selectedId, scrollToFlow, setCollapsedAreaIds, setCollapsedFlowIds, setCollapsedGroupKeys]);
}
