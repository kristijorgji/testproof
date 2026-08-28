import type { Ledger } from '@testproof/core';

import { collectAncestorIds, findFlowById, findFlowLocation } from '../FlowNavTree/flow-nav-rows';

import { groupDisplayTitle } from '@/lib/group-display-title';

export function flowBreadcrumb(ledger: Ledger, flowId: string): string | undefined {
    const location = findFlowLocation(ledger, flowId);
    if (!location) return undefined;
    const area = ledger.areas.find((item) => item.id === location.areaId);
    const group = area?.groups[location.groupIndex];
    if (!area || !group) return undefined;
    const ancestors = collectAncestorIds(ledger, flowId)
        .slice()
        .reverse()
        .map((id) => findFlowById(ledger, id)?.title ?? id);
    const parts = [area.title, groupDisplayTitle(group), ...ancestors];
    return parts.join(' / ');
}
