import type { Flow, FlowParent, Ledger } from '@testproof/core';

export type NavRow =
    | { kind: 'area'; key: string; areaId: string; title: string }
    | { kind: 'group'; key: string; areaId: string; groupIndex: number; title: string }
    | {
          kind: 'flow';
          key: string;
          id: string;
          title: string;
          depth: number;
          areaId: string;
          groupIndex: number;
          parentFlowId?: string;
          index: number;
          siblingCount: number;
          hasChildren: boolean;
      };

export interface FlattenNavOptions {
    collapsedAreaIds: ReadonlySet<string>;
    collapsedFlowIds: ReadonlySet<string>;
    collapsedGroupKeys?: ReadonlySet<string>;
}

export interface FlowLocation extends FlowParent {
    index: number;
    siblingCount: number;
}

export function flattenVisibleNavRows(ledger: Ledger, options: FlattenNavOptions): NavRow[] {
    const rows: NavRow[] = [];
    for (const area of ledger.areas) {
        rows.push({ kind: 'area', key: area.id, areaId: area.id, title: area.title });
        if (options.collapsedAreaIds.has(area.id)) continue;
        for (let groupIndex = 0; groupIndex < area.groups.length; groupIndex += 1) {
            const group = area.groups[groupIndex];
            if (!group) continue;
            rows.push({
                kind: 'group',
                key: `${area.id}::${groupIndex}`,
                areaId: area.id,
                groupIndex,
                title: group.title,
            });
            if (options.collapsedGroupKeys?.has(`${area.id}::${groupIndex}`)) continue;
            appendFlowRows(rows, group.flows, {
                areaId: area.id,
                groupIndex,
                depth: 0,
                collapsedFlowIds: options.collapsedFlowIds,
            });
        }
    }
    return rows;
}

export function findFlowLocation(ledger: Ledger, flowId: string): FlowLocation | undefined {
    for (const area of ledger.areas) {
        for (let groupIndex = 0; groupIndex < area.groups.length; groupIndex += 1) {
            const group = area.groups[groupIndex];
            if (!group) continue;
            const found = findInFlows(group.flows, flowId, area.id, groupIndex);
            if (found) return found;
        }
    }
    return undefined;
}

export function findFlowById(ledger: Ledger, flowId: string): Flow | undefined {
    for (const area of ledger.areas) {
        for (const group of area.groups) {
            const found = findFlowInList(group.flows, flowId);
            if (found) return found;
        }
    }
    return undefined;
}

export function isDescendantFlow(ledger: Ledger, ancestorId: string, maybeChildId: string): boolean {
    const ancestor = findFlowById(ledger, ancestorId);
    if (!ancestor) return false;
    return Boolean(findFlowInList(ancestor.children ?? [], maybeChildId));
}

export function collectAncestorIds(ledger: Ledger, flowId: string): string[] {
    const ids: string[] = [];
    let location = findFlowLocation(ledger, flowId);
    while (location?.parentFlowId) {
        ids.push(location.parentFlowId);
        location = findFlowLocation(ledger, location.parentFlowId);
    }
    return ids;
}

function appendFlowRows(
    rows: NavRow[],
    flows: Flow[],
    input: {
        areaId: string;
        groupIndex: number;
        depth: number;
        parentFlowId?: string;
        collapsedFlowIds: ReadonlySet<string>;
    },
): void {
    for (let index = 0; index < flows.length; index += 1) {
        const flow = flows[index];
        if (!flow) continue;
        const children = flow.children ?? [];
        rows.push({
            kind: 'flow',
            key: flow.id,
            id: flow.id,
            title: flow.title,
            depth: input.depth,
            areaId: input.areaId,
            groupIndex: input.groupIndex,
            parentFlowId: input.parentFlowId,
            index,
            siblingCount: flows.length,
            hasChildren: children.length > 0,
        });
        if (children.length > 0 && !input.collapsedFlowIds.has(flow.id)) {
            appendFlowRows(rows, children, {
                areaId: input.areaId,
                groupIndex: input.groupIndex,
                depth: input.depth + 1,
                parentFlowId: flow.id,
                collapsedFlowIds: input.collapsedFlowIds,
            });
        }
    }
}

function findInFlows(
    flows: Flow[],
    flowId: string,
    areaId: string,
    groupIndex: number,
    parentFlowId?: string,
): FlowLocation | undefined {
    for (let index = 0; index < flows.length; index += 1) {
        const flow = flows[index];
        if (!flow) continue;
        if (flow.id === flowId) {
            return { areaId, groupIndex, parentFlowId, index, siblingCount: flows.length };
        }
        const nested = findInFlows(flow.children ?? [], flowId, areaId, groupIndex, flow.id);
        if (nested) return nested;
    }
    return undefined;
}

function findFlowInList(flows: Flow[], flowId: string): Flow | undefined {
    for (const flow of flows) {
        if (flow.id === flowId) return flow;
        const nested = findFlowInList(flow.children ?? [], flowId);
        if (nested) return nested;
    }
    return undefined;
}
