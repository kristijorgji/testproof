import type { PlatformScannerConfig } from './config.js';
import { flattenFlows } from './parse.js';
import { platformCovers } from './platforms.js';
import { collectMaestroFlowInventory } from './scan/maestro.js';
import { collectTaggedSourceFiles } from './scan/web.js';
import type { CoverageCell, CoverageStatus, Flow, Ledger } from './schema.js';
import { cellKey, cellsMatch, resolveTargets } from './targets.js';

export interface FlowCoverage {
    id: string;
    manual: boolean;
    filesByPlatform: Record<string, string[]>;
    demanded: CoverageCell[];
    covered: CoverageCell[];
    status: CoverageStatus;
}

export interface DeriveCoverageOptions {
    scanners: PlatformScannerConfig[];
}

function uniqueSorted(values: Iterable<string>): string[] {
    return [...new Set(values)].sort();
}

interface Hit {
    platform: string;
    file: string;
}

function collectHits(options: DeriveCoverageOptions): {
    hits: Map<string, Hit[]>;
    filesByPlatform: Map<string, Map<string, string[]>>;
} {
    const hits = new Map<string, Hit[]>();
    const filesByPlatform = new Map<string, Map<string, string[]>>();

    const add = (flowId: string, platform: string, file: string): void => {
        const list = hits.get(flowId) ?? [];
        list.push({ platform, file });
        hits.set(flowId, list);
        const perPlatform = filesByPlatform.get(flowId) ?? new Map<string, string[]>();
        const files = perPlatform.get(platform) ?? [];
        files.push(file);
        perPlatform.set(platform, uniqueSorted(files));
        filesByPlatform.set(flowId, perPlatform);
    };

    for (const scanner of options.scanners) {
        const prefix = scanner.linkPrefix ?? scanner.dir;
        if (scanner.extractor === 'regex-tag') {
            for (const file of collectTaggedSourceFiles(scanner.dir, { ignore: scanner.ignore })) {
                const platform = file.platformOverride ?? scanner.name;
                for (const id of file.flowIds) {
                    add(id, platform, `${prefix}/${file.relativePath}`);
                }
            }
        } else {
            for (const row of collectMaestroFlowInventory(scanner.dir)) {
                const platformTag = row.tags.find((t) => t.startsWith('platform:'));
                const platform = platformTag ? platformTag.slice('platform:'.length) : scanner.name;
                for (const tag of row.tags) {
                    if (!tag.startsWith('FLOW-')) continue;
                    add(tag, platform, `${prefix}/${row.relativePath}`);
                }
            }
        }
    }

    return { hits, filesByPlatform };
}

function statusFromCells(
    manual: boolean,
    draft: boolean,
    demanded: CoverageCell[],
    covered: CoverageCell[],
): CoverageStatus {
    if (manual || draft) return 'manual';
    if (demanded.length === 0) return covered.length > 0 ? 'automated' : 'todo';
    const matched = demanded.filter((d) =>
        covered.some(
            (c) =>
                cellsMatch(d, c) || (platformCovers(c.platform, d.platform) && Object.keys(d.dimensions).length === 0),
        ),
    );
    if (matched.length === demanded.length) return 'automated';
    if (matched.length > 0) return 'partial';
    return 'todo';
}

export function deriveCoverage(ledger: Ledger, options: DeriveCoverageOptions): Map<string, FlowCoverage> {
    const { hits, filesByPlatform } = collectHits(options);
    const result = new Map<string, FlowCoverage>();

    for (const flow of flattenFlows(ledger)) {
        const perPlatform = filesByPlatform.get(flow.id) ?? new Map<string, string[]>();
        const filesRecord: Record<string, string[]> = {};
        for (const [platform, files] of perPlatform) filesRecord[platform] = files;
        const demanded = resolveTargets(ledger, flow);
        const uniqueCovered: CoverageCell[] = [];
        const seen = new Set<string>();
        for (const hit of hits.get(flow.id) ?? []) {
            const cell: CoverageCell = { platform: hit.platform, dimensions: {} };
            const key = cellKey(cell);
            if (seen.has(key)) continue;
            seen.add(key);
            uniqueCovered.push(cell);
        }
        const manual = Boolean(flow.manual);
        const draft = flow.status === 'draft';

        result.set(flow.id, {
            id: flow.id,
            manual,
            filesByPlatform: filesRecord,
            demanded,
            covered: uniqueCovered,
            status: statusFromCells(manual, draft, demanded, uniqueCovered),
        });
    }
    return result;
}

export function summarizeCoverage(coverage: Map<string, FlowCoverage>): Record<CoverageStatus, number> {
    const summary: Record<CoverageStatus, number> = {
        automated: 0,
        partial: 0,
        todo: 0,
        manual: 0,
    };
    for (const row of coverage.values()) {
        summary[row.status] += 1;
    }
    return summary;
}

export function collectIncompleteCoreIds(
    ledger: Ledger,
    coverage: Map<string, FlowCoverage>,
    coreAreaIds: string[],
): string[] {
    const incomplete: string[] = [];
    for (const area of ledger.areas) {
        if (!coreAreaIds.includes(area.id)) continue;
        const walk = (flows: Flow[]): void => {
            for (const flow of flows) {
                if (flow.manual || flow.status === 'draft') {
                    if (flow.children?.length) walk(flow.children);
                    continue;
                }
                const row = coverage.get(flow.id);
                if (row && row.status !== 'automated') incomplete.push(flow.id);
                if (flow.children?.length) walk(flow.children);
            }
        };
        for (const group of area.groups) walk(group.flows);
    }
    return uniqueSorted(incomplete);
}
