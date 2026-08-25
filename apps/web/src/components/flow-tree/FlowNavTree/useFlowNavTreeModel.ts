import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual';
import type { Ledger } from '@testproof/core';
import { type RefObject, useCallback, useMemo, useRef } from 'react';

import { flattenVisibleNavRows, type NavRow } from './flow-nav-rows';
import { useFlowNavSelection } from './useFlowNavSelection';

interface FlowNavTreeModel {
    scrollRef: RefObject<HTMLDivElement | null>;
    rows: NavRow[];
    flowIds: string[];
    virtualizer: Virtualizer<HTMLDivElement, Element>;
}

export function useFlowNavTreeModel({
    ledger,
    selectedId,
    collapsedAreaIds,
    collapsedFlowIds,
    onCollapsedAreaIdsChange,
    onCollapsedFlowIdsChange,
}: {
    ledger: Ledger;
    selectedId?: string;
    collapsedAreaIds: Set<string>;
    collapsedFlowIds: Set<string>;
    onCollapsedAreaIdsChange: (update: (current: Set<string>) => Set<string>) => void;
    onCollapsedFlowIdsChange: (update: (current: Set<string>) => Set<string>) => void;
}): FlowNavTreeModel {
    const scrollRef = useRef<HTMLDivElement>(null);
    const rows = useMemo(
        () => flattenVisibleNavRows(ledger, { collapsedAreaIds, collapsedFlowIds }),
        [ledger, collapsedAreaIds, collapsedFlowIds],
    );
    const flowIds = useMemo(
        () => rows.filter((row): row is Extract<NavRow, { kind: 'flow' }> => row.kind === 'flow').map((row) => row.id),
        [rows],
    );
    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => 36,
        overscan: 8,
    });
    const scrollToFlow = useCallback(
        (index: number, flowId: string) => {
            virtualizer.scrollToIndex(index, { align: 'auto' });
            document.querySelector(`[data-flow-id="${flowId}"]`)?.scrollIntoView({ block: 'nearest' });
        },
        [virtualizer],
    );

    useFlowNavSelection({
        ledger,
        selectedId,
        rows,
        setCollapsedAreaIds: onCollapsedAreaIdsChange,
        setCollapsedFlowIds: onCollapsedFlowIdsChange,
        scrollToFlow,
    });

    return { scrollRef, rows, flowIds, virtualizer };
}
