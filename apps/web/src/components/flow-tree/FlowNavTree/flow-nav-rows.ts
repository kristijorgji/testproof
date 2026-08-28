import type { Flow, FlowGroup, FlowParent, Ledger } from '@testproof/core';

import { groupDisplayTitle } from '@/lib/group-display-title';

export type NavRow =
    | { kind: 'area'; key: string; areaId: string; title: string }
    | { kind: 'cluster'; key: string; areaId: string; title: string }
    | {
          kind: 'group';
          key: string;
          areaId: string;
          groupIndex: number;
          title: string;
          nestedUnderCluster: boolean;
      }
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

function clusterKeyForTitle(areaId: string, title: string): string {
    return `${areaId}::cluster::${title}`;
}

function groupNavKey(areaId: string, groupIndex: number): string {
    return `${areaId}::${groupIndex}`;
}

/** Keys that must be expanded so a flow under a (possibly clustered) group is visible. */
export function navCollapseKeysForFlow(ledger: Ledger, flowId: string): string[] {
    const location = findFlowLocation(ledger, flowId);
    if (!location) return [];
    const area = ledger.areas.find((item) => item.id === location.areaId);
    const group = area?.groups[location.groupIndex];
    if (!area || !group) return [];
    const keys = [groupNavKey(location.areaId, location.groupIndex)];
    if (shouldClusterTitle(area.groups, group.title)) {
        keys.push(clusterKeyForTitle(location.areaId, group.title));
    }
    return keys;
}

export function flattenVisibleNavRows(ledger: Ledger, options: FlattenNavOptions): NavRow[] {
    const rows: NavRow[] = [];
    for (const area of ledger.areas) {
        rows.push({ kind: 'area', key: area.id, areaId: area.id, title: area.title });
        if (options.collapsedAreaIds.has(area.id)) continue;
        appendGroupedRows(rows, area.id, area.groups, options);
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

function shouldClusterTitle(groups: FlowGroup[], title: string): boolean {
    return groups.filter((group) => group.title === title).length > 1;
}

function appendGroupedRows(rows: NavRow[], areaId: string, groups: FlowGroup[], options: FlattenNavOptions): void {
    const seenTitles = new Set<string>();
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
        const group = groups[groupIndex];
        if (!group || seenTitles.has(group.title)) continue;
        seenTitles.add(group.title);
        const indexes = groups
            .map((item, index) => (item.title === group.title ? index : -1))
            .filter((index) => index >= 0);
        if (indexes.length > 1) {
            const clusterKey = clusterKeyForTitle(areaId, group.title);
            rows.push({ kind: 'cluster', key: clusterKey, areaId, title: group.title });
            if (options.collapsedGroupKeys?.has(clusterKey)) continue;
            for (const index of indexes) {
                const clustered = groups[index];
                if (!clustered) continue;
                appendGroupAndFlows(rows, areaId, index, clustered, true, options);
            }
            continue;
        }
        appendGroupAndFlows(rows, areaId, groupIndex, group, false, options);
    }
}

function appendGroupAndFlows(
    rows: NavRow[],
    areaId: string,
    groupIndex: number,
    group: FlowGroup,
    nestedUnderCluster: boolean,
    options: FlattenNavOptions,
): void {
    const key = groupNavKey(areaId, groupIndex);
    rows.push({
        kind: 'group',
        key,
        areaId,
        groupIndex,
        title: nestedUnderCluster ? (group.subtitle ?? group.title) : groupDisplayTitle(group),
        nestedUnderCluster,
    });
    if (options.collapsedGroupKeys?.has(key)) return;
    appendFlowRows(rows, group.flows, {
        areaId,
        groupIndex,
        depth: nestedUnderCluster ? 1 : 0,
        collapsedFlowIds: options.collapsedFlowIds,
    });
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
