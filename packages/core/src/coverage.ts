import type { PlatformScannerConfig } from './config.js';
import { flattenFlows } from './parse.js';
import { inferAreaScope, ledgerPlatforms, platformCovers } from './platforms.js';
import { cellKey, cellsMatch, resolveTargets } from './targets.js';
import type { CoverageCell, CoverageStatus, Flow, FlowScope, Ledger } from './schema.js';
import { collectMaestroFlowInventory } from './scan/maestro.js';
import { collectTaggedSourceFiles, collectWebE2eFlowFileMap } from './scan/web.js';

export interface PlatformCoverage {
    files: string[];
}

export interface FlowCoverage {
    id: string;
    scope: FlowScope;
    manual: boolean;
    web: PlatformCoverage;
    mobile: PlatformCoverage;
    filesByPlatform: Record<string, string[]>;
    demanded: CoverageCell[];
    covered: CoverageCell[];
    status: CoverageStatus;
}

export interface DeriveCoverageOptions {
    scanners?: PlatformScannerConfig[];
    /** @deprecated use scanners */
    maestroFlowsDir?: string;
    /** @deprecated use scanners */
    webSpecsDir?: string;
    maestroLinkPrefix?: string;
    webLinkPrefix?: string;
}

function uniqueSorted(values: Iterable<string>): string[] {
    return [...new Set(values)].sort();
}

export function collectMaestroFlowFileMap(flowsDir: string): Map<string, string[]> {
    const map = new Map<string, string[]>();
    for (const row of collectMaestroFlowInventory(flowsDir)) {
        for (const tag of row.tags) {
            if (!tag.startsWith('FLOW-')) continue;
            const list = map.get(tag) ?? [];
            list.push(row.relativePath);
            map.set(tag, list);
        }
    }
    for (const [id, files] of map) {
        map.set(id, uniqueSorted(files));
    }
    return map;
}

export function coverageStatusFor(
    scope: FlowScope,
    manual: boolean,
    webFiles: string[],
    mobileFiles: string[],
): CoverageStatus {
    if (manual) return 'manual';
    const hasWeb = webFiles.length > 0;
    const hasMobile = mobileFiles.length > 0;
    switch (scope) {
        case 'web':
            return hasWeb ? 'automated' : 'todo';
        case 'mobile':
            return hasMobile ? 'automated' : 'todo';
        case 'common':
            if (hasWeb && hasMobile) return 'automated';
            if (hasWeb || hasMobile) return 'partial';
            return 'todo';
        default:
            return 'todo';
    }
}

function areaScopeForFlow(ledger: Ledger, flowId: string): FlowScope {
    const platforms = ledgerPlatforms(ledger);
    for (const area of ledger.areas) {
        const walk = (flows: Flow[]): boolean => {
            for (const f of flows) {
                if (f.id === flowId) return true;
                if (f.children?.length && walk(f.children)) return true;
            }
            return false;
        };
        for (const group of area.groups) {
            if (walk(group.flows)) return inferAreaScope(area, platforms);
        }
    }
    return 'common';
}

interface Hit {
    platform: string;
    file: string;
}

function collectHits(options: DeriveCoverageOptions): { hits: Map<string, Hit[]>; filesByPlatform: Map<string, Map<string, string[]>> } {
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

    let scanners = options.scanners;
    if (!scanners?.length) {
        scanners = [];
        if (options.webSpecsDir) {
            scanners.push({
                name: 'web',
                dir: options.webSpecsDir,
                extractor: 'regex-tag',
                ignore: ['__screenshots__', 'node_modules'],
                linkPrefix: options.webLinkPrefix ?? '../../apps/web-e2e/src/specs',
            });
        }
        if (options.maestroFlowsDir) {
            scanners.push({
                name: 'mobile',
                dir: options.maestroFlowsDir,
                extractor: 'maestro-tags',
                linkPrefix: options.maestroLinkPrefix ?? '../../apps/mobile/.maestro/flows',
            });
        }
    }

    for (const scanner of scanners) {
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

function statusFromCells(manual: boolean, draft: boolean, demanded: CoverageCell[], covered: CoverageCell[]): CoverageStatus {
    if (manual || draft) return 'manual';
    if (demanded.length === 0) return covered.length > 0 ? 'automated' : 'todo';
    const matched = demanded.filter((d) => covered.some((c) => cellsMatch(d, c) || platformCovers(c.platform, d.platform) && Object.keys(d.dimensions).length === 0));
    if (matched.length === demanded.length) return 'automated';
    if (matched.length > 0) return 'partial';
    return 'todo';
}

export function deriveCoverage(ledger: Ledger, options: DeriveCoverageOptions): Map<string, FlowCoverage> {
    const { hits, filesByPlatform } = collectHits(options);
    const result = new Map<string, FlowCoverage>();

    for (const flow of flattenFlows(ledger)) {
        const scope = areaScopeForFlow(ledger, flow.id);
        const perPlatform = filesByPlatform.get(flow.id) ?? new Map<string, string[]>();
        const filesRecord: Record<string, string[]> = {};
        for (const [platform, files] of perPlatform) filesRecord[platform] = files;
        const webFiles = filesRecord.web ?? [];
        const mobileFiles = filesRecord.mobile ?? [];
        const demanded = resolveTargets(ledger, flow);
        const covered: CoverageCell[] = (hits.get(flow.id) ?? []).map((h) => ({
            platform: h.platform,
            dimensions: {},
        }));
        const uniqueCovered: CoverageCell[] = [];
        const seen = new Set<string>();
        for (const cell of covered) {
            const key = cellKey(cell);
            if (seen.has(key)) continue;
            seen.add(key);
            uniqueCovered.push(cell);
        }
        const manual = Boolean(flow.manual);
        const draft = flow.status === 'draft';
        const useLegacy = demanded.every((c) => Object.keys(c.dimensions).length === 0) && (scope === 'common' || scope === 'web' || scope === 'mobile');
        const status = useLegacy
            ? coverageStatusFor(scope, manual || draft, webFiles, mobileFiles)
            : statusFromCells(manual, draft, demanded, uniqueCovered);

        result.set(flow.id, {
            id: flow.id,
            scope,
            manual,
            web: { files: webFiles },
            mobile: { files: mobileFiles },
            filesByPlatform: filesRecord,
            demanded,
            covered: uniqueCovered,
            status,
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

export { collectWebE2eFlowFileMap };
