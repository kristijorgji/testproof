import type { FlowParent, Ledger } from '@testproof/core';
import { flattenFlowIds } from '@testproof/core/parse';

import { findFlowById, isDescendantFlow } from '../FlowNavTree/flow-nav-rows';

import type { FlowCoverageById } from './flow-coverage-types';

export function collectDeletedFlowIds(ledger: Ledger, deletedId: string): Set<string> {
    const deleted = new Set<string>([deletedId]);
    const root = findFlowById(ledger, deletedId);
    if (!root?.children?.length) return deleted;
    const walk = (flows: typeof root.children): void => {
        for (const flow of flows ?? []) {
            deleted.add(flow.id);
            if (flow.children?.length) walk(flow.children);
        }
    };
    walk(root.children);
    return deleted;
}

export function nextFlowIdAfterDelete(ledger: Ledger, deletedId: string): string | undefined {
    const deleted = collectDeletedFlowIds(ledger, deletedId);
    const all = flattenFlowIds(ledger);
    const surviving = all.filter((id) => !deleted.has(id));
    const index = all.indexOf(deletedId);
    if (index < 0) return surviving[0];
    for (let i = index + 1; i < all.length; i += 1) {
        const candidate = all[i];
        if (candidate && !deleted.has(candidate)) return candidate;
    }
    for (let i = index - 1; i >= 0; i -= 1) {
        const candidate = all[i];
        if (candidate && !deleted.has(candidate)) return candidate;
    }
    return undefined;
}

export function selectionSurvivesDelete(ledger: Ledger, deletedId: string, selectedId?: string): boolean {
    if (!selectedId) return true;
    if (selectedId === deletedId) return false;
    return !isDescendantFlow(ledger, deletedId, selectedId);
}

export function flowHasChildren(ledger: Ledger, flowId: string): boolean {
    const flow = findFlowById(ledger, flowId);
    return Boolean(flow?.children?.length);
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
