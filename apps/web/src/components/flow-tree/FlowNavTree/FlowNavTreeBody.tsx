'use client';

import type { Virtualizer } from '@tanstack/react-virtual';
import type { CoverageStatus, Ledger, LedgerPatch } from '@testproof/core';
import type { ReactNode, RefObject } from 'react';

import { handleFlowNavKeyDown } from './flow-nav-keyboard';
import type { NavRow } from './flow-nav-rows';
import { FlowNavDndTree } from './FlowNavDndTree';
import { FlowNavScrollList } from './FlowNavScrollList';

export function FlowNavTreeBody(props: {
    ledger: Ledger;
    rows: NavRow[];
    flowIds: string[];
    scrollRef: RefObject<HTMLDivElement | null>;
    virtualizer: Virtualizer<HTMLDivElement, Element>;
    selectedId?: string;
    collapsedAreaIds: Set<string>;
    collapsedFlowIds: Set<string>;
    collapsedGroupKeys: Set<string>;
    enableDrag: boolean;
    statusByFlowId?: (id: string) => CoverageStatus;
    renderFlowActions?: (flowId: string) => ReactNode;
    onSelect?: (flowId: string) => void;
    onToggleArea: (areaId: string) => void;
    onToggleFlow: (flowId: string) => void;
    onToggleGroup: (groupKey: string) => void;
    onMove?: (patch: LedgerPatch) => void;
    onIndent?: () => void;
    onOutdent?: () => void;
    onRequestDelete?: () => void;
    onFocusTitle?: () => void;
}) {
    const list = (
        <FlowNavScrollList
            scrollRef={props.scrollRef}
            rows={props.rows}
            virtualizer={props.virtualizer}
            selectedId={props.selectedId}
            collapsedAreaIds={props.collapsedAreaIds}
            collapsedFlowIds={props.collapsedFlowIds}
            collapsedGroupKeys={props.collapsedGroupKeys}
            enableDrag={props.enableDrag}
            statusByFlowId={props.statusByFlowId}
            renderFlowActions={props.renderFlowActions}
            onSelect={props.onSelect}
            onToggleArea={props.onToggleArea}
            onToggleFlow={props.onToggleFlow}
            onToggleGroup={props.onToggleGroup}
            onKeyDown={(event) => {
                const selectedId = props.selectedId;
                handleFlowNavKeyDown({
                    event,
                    rows: props.rows,
                    selectedId,
                    onSelect: props.onSelect,
                    onIndent: props.onIndent,
                    onOutdent: props.onOutdent,
                    onRequestDelete: props.onRequestDelete,
                    onFocusTitle: props.onFocusTitle,
                    onToggleSelected: selectedId ? () => props.onToggleFlow(selectedId) : undefined,
                });
            }}
        />
    );
    if (!props.enableDrag) return list;
    return (
        <FlowNavDndTree
            ledger={props.ledger}
            rows={props.rows}
            flowIds={props.flowIds}
            statusByFlowId={props.statusByFlowId}
            onMove={props.onMove}
        >
            {list}
        </FlowNavDndTree>
    );
}
