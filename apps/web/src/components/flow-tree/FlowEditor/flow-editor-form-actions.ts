import type { Flow, FlowParent, Ledger, LedgerPatch } from '@testproof/core';
import { flattenFlowIds } from '@testproof/core/parse';
import { FLOW_ID_RE } from '@testproof/core/schema';

import { findFlowById, findFlowLocation, isDescendantFlow } from '../FlowNavTree/flow-nav-rows';

import { hasCoverageWarning, nextFlowIdAfterDelete, parseGroupKey } from './flow-editor-helpers';
import type { FlowCoverageById } from './useFlowEditorActions';

export function buildAddFlowPatch(input: {
    ledger: Ledger;
    flows: Flow[];
    newFlowId: string;
    newFlowTitle: string;
    createGroupKey: string;
    createParentId?: string;
    selectedId?: string;
}): { patch: LedgerPatch; error?: string } | { patch?: undefined; error: string } {
    if (!FLOW_ID_RE.test(input.newFlowId)) {
        return { error: 'invalidFlowId' };
    }
    if (flattenFlowIds(input.ledger).includes(input.newFlowId)) {
        return { error: 'duplicateFlowId' };
    }

    let parent: FlowParent | undefined = parseGroupKey(input.createGroupKey);
    let index = 0;

    if (input.createParentId) {
        const location = findFlowLocation(input.ledger, input.createParentId);
        if (location) {
            const parentFlow = findFlowById(input.ledger, input.createParentId);
            parent = {
                areaId: location.areaId,
                groupIndex: location.groupIndex,
                parentFlowId: input.createParentId,
            };
            index = parentFlow?.children?.length ?? 0;
        }
    } else if (input.selectedId) {
        const location = findFlowLocation(input.ledger, input.selectedId);
        if (location) {
            parent = {
                areaId: location.areaId,
                groupIndex: location.groupIndex,
                parentFlowId: location.parentFlowId,
            };
            index = location.index + 1;
        }
    }

    if (!parent) {
        parent = { areaId: input.ledger.areas[0]?.id ?? 'HOME', groupIndex: 0 };
    }

    return {
        patch: {
            op: 'add-flow',
            parent,
            flow: { id: input.newFlowId, title: input.newFlowTitle || input.newFlowId },
            index,
        },
    };
}

export function buildAddAreaPatch(input: {
    ledger: Ledger;
    newAreaId: string;
    newAreaTitle: string;
}): { patch: LedgerPatch } | { error: string } {
    if (!input.newAreaId.trim() || !input.newAreaTitle.trim()) {
        return { error: 'areaRequired' };
    }
    return {
        patch: {
            op: 'add-area',
            area: { id: input.newAreaId.trim(), title: input.newAreaTitle.trim() },
            index: input.ledger.areas.length,
        },
    };
}

export function buildMoveFlowPatch(ledger: Ledger, flowId: string, delta: number): LedgerPatch | null {
    const location = findFlowLocation(ledger, flowId);
    if (!location) return null;
    const next = location.index + delta;
    if (next < 0 || next >= location.siblingCount) return null;
    return buildMoveFlowTo(ledger, flowId, {
        areaId: location.areaId,
        groupIndex: location.groupIndex,
        parentFlowId: location.parentFlowId,
        index: next,
    });
}

export function buildMoveFlowTo(
    ledger: Ledger,
    flowId: string,
    to: FlowParent & { index: number },
): LedgerPatch | null {
    const from = findFlowLocation(ledger, flowId);
    if (!from) return null;
    if (to.parentFlowId === flowId) return null;
    if (to.parentFlowId && isDescendantFlow(ledger, flowId, to.parentFlowId)) return null;

    let index = to.index;
    const sameParent =
        from.areaId === to.areaId && from.groupIndex === to.groupIndex && from.parentFlowId === to.parentFlowId;
    if (sameParent && from.index < index) {
        index -= 1;
    }
    if (index < 0) return null;
    if (sameParent && from.index === index) return null;

    return {
        op: 'move-flow',
        flowId,
        to: {
            areaId: to.areaId,
            groupIndex: to.groupIndex,
            parentFlowId: to.parentFlowId,
            index,
        },
    };
}

export function removeConfirmFor(
    flowId: string,
    flows: Flow[],
    coverage: FlowCoverageById,
): 'covered' | 'plain' | null {
    if (!flows.some((flow) => flow.id === flowId)) return null;
    return hasCoverageWarning(flowId, coverage) ? 'covered' : 'plain';
}

export function nextSelectedAfterDelete(ledger: Ledger, flowId: string, selectedId?: string): string | undefined {
    if (selectedId !== flowId) return selectedId;
    return nextFlowIdAfterDelete(ledger, flowId);
}
