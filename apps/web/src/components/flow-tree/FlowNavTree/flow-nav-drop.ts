import type { Ledger, LedgerPatch } from '@testproof/core';

import { buildMoveFlowTo } from '../FlowEditor/flow-editor-form-actions';

import { findFlowById, findFlowLocation, type NavRow } from './flow-nav-rows';

export type DropZone = 'before' | 'after' | 'child';

export function buildDropMovePatch(input: {
    ledger: Ledger;
    dragFlowId: string;
    overKey: string;
    overKind: NavRow['kind'];
    zone: DropZone;
}): LedgerPatch | null {
    const { ledger, dragFlowId, overKey, overKind, zone } = input;
    if (overKind === 'area') {
        return dropOnArea(ledger, dragFlowId, overKey);
    }
    if (overKind === 'group') {
        return dropOnGroup(ledger, dragFlowId, overKey);
    }
    return dropOnFlow(ledger, dragFlowId, overKey, zone);
}

function dropOnArea(ledger: Ledger, dragFlowId: string, areaId: string): LedgerPatch | null {
    const area = ledger.areas.find((item) => item.id === areaId);
    if (!area || area.groups.length === 0) return null;
    const groupIndex = area.groups.length - 1;
    const group = area.groups[groupIndex];
    if (!group) return null;
    return buildMoveFlowTo(ledger, dragFlowId, {
        areaId,
        groupIndex,
        index: group.flows.length,
    });
}

function dropOnGroup(ledger: Ledger, dragFlowId: string, groupKey: string): LedgerPatch | null {
    const [areaId, groupIndexRaw] = groupKey.split('::');
    const groupIndex = Number(groupIndexRaw);
    if (!areaId || Number.isNaN(groupIndex)) return null;
    const area = ledger.areas.find((item) => item.id === areaId);
    const group = area?.groups[groupIndex];
    if (!group) return null;
    return buildMoveFlowTo(ledger, dragFlowId, {
        areaId,
        groupIndex,
        index: group.flows.length,
    });
}

function dropOnFlow(ledger: Ledger, dragFlowId: string, overFlowId: string, zone: DropZone): LedgerPatch | null {
    const over = findFlowLocation(ledger, overFlowId);
    if (!over) return null;
    if (zone === 'child') {
        const overFlow = findFlowById(ledger, overFlowId);
        return buildMoveFlowTo(ledger, dragFlowId, {
            areaId: over.areaId,
            groupIndex: over.groupIndex,
            parentFlowId: overFlowId,
            index: overFlow?.children?.length ?? 0,
        });
    }
    return buildMoveFlowTo(ledger, dragFlowId, {
        areaId: over.areaId,
        groupIndex: over.groupIndex,
        parentFlowId: over.parentFlowId,
        index: zone === 'before' ? over.index : over.index + 1,
    });
}
