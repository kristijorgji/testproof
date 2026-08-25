import type { FlowParent, Ledger } from '@testproof/core';
import { flattenFlowIds } from '@testproof/core/parse';

import type { FlowCoverageById } from './useFlowEditorActions';

export function nextFlowIdAfterDelete(ledger: Ledger, deletedId: string): string | undefined {
    const ids = flattenFlowIds(ledger).filter((id) => id !== deletedId);
    const all = flattenFlowIds(ledger);
    const index = all.indexOf(deletedId);
    if (index < 0) return ids[0];
    return ids[index] ?? ids[index - 1];
}

export function hasCoverageWarning(flowId: string, coverage: FlowCoverageById): boolean {
    const row = coverage[flowId];
    if (!row) return false;
    if (row.status === 'todo' || row.status === 'manual') return false;
    return row.covered.length > 0;
}

export function parseGroupKey(value: string): FlowParent | undefined {
    const [areaId, groupIndexRaw] = value.split('::');
    const groupIndex = Number(groupIndexRaw);
    if (!areaId || Number.isNaN(groupIndex)) return undefined;
    return { areaId, groupIndex };
}
