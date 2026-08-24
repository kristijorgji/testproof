import type { FlowParent, Ledger } from '@testproof/core';
import { flattenFlowIds } from '@testproof/core/parse';

import type { FlowCoverageById } from './useFlowEditorActions';

export function findFlowLocation(
    ledger: Ledger,
    flowId: string,
): (FlowParent & { index: number; groupLength: number }) | undefined {
    for (const area of ledger.areas) {
        for (let groupIndex = 0; groupIndex < area.groups.length; groupIndex += 1) {
            const group = area.groups[groupIndex];
            if (!group) continue;
            const index = group.flows.findIndex((flow) => flow.id === flowId);
            if (index >= 0) {
                return { areaId: area.id, groupIndex, index, groupLength: group.flows.length };
            }
        }
    }
    return undefined;
}

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
