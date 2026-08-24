import type { CoverageStatus, Flow, FlowArea, Ledger } from '@testproof/core';
import { platformCovers } from '@testproof/core/platforms';

import type { CoverageRow } from '@/lib/coverage-types';

export type CoverageStatusFilter = CoverageStatus | 'all';

function flowStatus(flowId: string, coverage: Record<string, CoverageRow>): CoverageStatus {
    return coverage[flowId]?.status ?? 'todo';
}

function flowMatchesSearch(flow: Flow, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    if (flow.id.toLowerCase().includes(q) || flow.title.toLowerCase().includes(q)) return true;
    return (flow.children ?? []).some((child) => flowMatchesSearch(child, q));
}

function flowMatchesStatus(
    flowId: string,
    statusFilter: CoverageStatusFilter,
    coverage: Record<string, CoverageRow>,
): boolean {
    if (statusFilter === 'all') return true;
    return flowStatus(flowId, coverage) === statusFilter;
}

function collectFlowPlatforms(flow: Flow, row: CoverageRow | undefined): Set<string> {
    const platforms = new Set<string>();
    for (const cell of row?.demanded ?? []) platforms.add(cell.platform);
    for (const cell of row?.covered ?? []) platforms.add(cell.platform);
    for (const [platform, files] of Object.entries(row?.files ?? {})) {
        if (files.length > 0) platforms.add(platform);
    }
    for (const target of flow.targets ?? []) {
        const id = typeof target === 'string' ? target : target.platform;
        platforms.add(id);
    }
    return platforms;
}

function platformSetMatchesFilter(platforms: Set<string>, platformFilter: Set<string>): boolean {
    for (const filter of platformFilter) {
        for (const platform of platforms) {
            if (platformCovers(platform, filter) || platformCovers(filter, platform)) return true;
        }
    }
    return false;
}

function flowMatchesPlatform(flow: Flow, platformFilter: Set<string>, row: CoverageRow | undefined): boolean {
    if (platformFilter.size === 0) return true;
    return platformSetMatchesFilter(collectFlowPlatforms(flow, row), platformFilter);
}

function filterFlowTree(
    flow: Flow,
    query: string,
    statusFilter: CoverageStatusFilter,
    platformFilter: Set<string>,
    coverage: Record<string, CoverageRow>,
): Flow | null {
    const childMatches = (flow.children ?? [])
        .map((child) => filterFlowTree(child, query, statusFilter, platformFilter, coverage))
        .filter((child): child is Flow => child !== null);

    const selfMatches =
        flowMatchesSearch(flow, query) &&
        flowMatchesStatus(flow.id, statusFilter, coverage) &&
        flowMatchesPlatform(flow, platformFilter, coverage[flow.id]);

    if (!selfMatches && childMatches.length === 0) return null;

    if (childMatches.length === 0 && selfMatches) return flow;
    return { ...flow, children: childMatches.length ? childMatches : flow.children };
}

function filterAreaFlows(
    area: FlowArea,
    query: string,
    statusFilter: CoverageStatusFilter,
    platformFilter: Set<string>,
    coverage: Record<string, CoverageRow>,
): FlowArea | null {
    const groups = area.groups
        .map((group) => {
            const flows = group.flows
                .map((flow) => filterFlowTree(flow, query, statusFilter, platformFilter, coverage))
                .filter((flow): flow is Flow => flow !== null);
            if (flows.length === 0) return null;
            return { ...group, flows };
        })
        .filter((group): group is NonNullable<typeof group> => group !== null);

    if (groups.length === 0) return null;
    return { ...area, groups };
}

export function filterLedgerForCoverage(
    ledger: Ledger,
    query: string,
    statusFilter: CoverageStatusFilter,
    platformFilter: Set<string>,
    coverage: Record<string, CoverageRow>,
): FlowArea[] {
    return ledger.areas
        .map((area) => filterAreaFlows(area, query, statusFilter, platformFilter, coverage))
        .filter((area): area is FlowArea => area !== null);
}

export function formatCoverageCell(cell: { platform: string; dimensions: Record<string, string> }): string {
    const dims = Object.entries(cell.dimensions)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ');
    return dims ? `${cell.platform} (${dims})` : cell.platform;
}

export function flowTreeContains(flow: Flow, flowId: string): boolean {
    if (flow.id === flowId) return true;
    return (flow.children ?? []).some((child) => flowTreeContains(child, flowId));
}
