import type { CoverageStatus, Ledger, LedgerPatch } from '@testproof/core';
import type { ReactNode } from 'react';

export interface FlowNavTreeProps {
    ledger: Ledger;
    selectedId?: string;
    collapsedAreaIds: Set<string>;
    collapsedFlowIds: Set<string>;
    enableDrag?: boolean;
    statusByFlowId?: (id: string) => CoverageStatus;
    renderFlowActions?: (flowId: string) => ReactNode;
    onSelect?: (flowId: string) => void;
    onToggleArea: (areaId: string) => void;
    onToggleFlow: (flowId: string) => void;
    onCollapsedAreaIdsChange: (update: (current: Set<string>) => Set<string>) => void;
    onCollapsedFlowIdsChange: (update: (current: Set<string>) => Set<string>) => void;
    onMove?: (patch: LedgerPatch) => void;
}
