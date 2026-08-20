import { flattenFlows } from './parse.js';
import { inferAreaScope, ledgerPlatforms, platformCovers } from './platforms.js';
import { cellKey, cellsMatch, resolveTargets } from './targets.js';
import { collectMaestroFlowInventory } from './scan/maestro.js';
import { collectTaggedSourceFiles, collectWebE2eFlowFileMap } from './scan/web.js';
function uniqueSorted(values) {
    return [...new Set(values)].sort();
}
export function collectMaestroFlowFileMap(flowsDir) {
    const map = new Map();
    for (const row of collectMaestroFlowInventory(flowsDir)) {
        for (const tag of row.tags) {
            if (!tag.startsWith('FLOW-'))
                continue;
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
export function coverageStatusFor(scope, manual, webFiles, mobileFiles) {
    if (manual)
        return 'manual';
    const hasWeb = webFiles.length > 0;
    const hasMobile = mobileFiles.length > 0;
    switch (scope) {
        case 'web':
            return hasWeb ? 'automated' : 'todo';
        case 'mobile':
            return hasMobile ? 'automated' : 'todo';
        case 'common':
            if (hasWeb && hasMobile)
                return 'automated';
            if (hasWeb || hasMobile)
                return 'partial';
            return 'todo';
        default:
            return 'todo';
    }
}
function areaScopeForFlow(ledger, flowId) {
    const platforms = ledgerPlatforms(ledger);
    for (const area of ledger.areas) {
        const walk = (flows) => {
            for (const f of flows) {
                if (f.id === flowId)
                    return true;
                if (f.children?.length && walk(f.children))
                    return true;
            }
            return false;
        };
        for (const group of area.groups) {
            if (walk(group.flows))
                return inferAreaScope(area, platforms);
        }
    }
    return 'common';
}
function collectHits(options) {
    const hits = new Map();
    const filesByPlatform = new Map();
    const add = (flowId, platform, file) => {
        const list = hits.get(flowId) ?? [];
        list.push({ platform, file });
        hits.set(flowId, list);
        const perPlatform = filesByPlatform.get(flowId) ?? new Map();
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
        }
        else {
            for (const row of collectMaestroFlowInventory(scanner.dir)) {
                const platformTag = row.tags.find((t) => t.startsWith('platform:'));
                const platform = platformTag ? platformTag.slice('platform:'.length) : scanner.name;
                for (const tag of row.tags) {
                    if (!tag.startsWith('FLOW-'))
                        continue;
                    add(tag, platform, `${prefix}/${row.relativePath}`);
                }
            }
        }
    }
    return { hits, filesByPlatform };
}
function statusFromCells(manual, draft, demanded, covered) {
    if (manual || draft)
        return 'manual';
    if (demanded.length === 0)
        return covered.length > 0 ? 'automated' : 'todo';
    const matched = demanded.filter((d) => covered.some((c) => cellsMatch(d, c) || platformCovers(c.platform, d.platform) && Object.keys(d.dimensions).length === 0));
    if (matched.length === demanded.length)
        return 'automated';
    if (matched.length > 0)
        return 'partial';
    return 'todo';
}
export function deriveCoverage(ledger, options) {
    const { hits, filesByPlatform } = collectHits(options);
    const result = new Map();
    for (const flow of flattenFlows(ledger)) {
        const scope = areaScopeForFlow(ledger, flow.id);
        const perPlatform = filesByPlatform.get(flow.id) ?? new Map();
        const filesRecord = {};
        for (const [platform, files] of perPlatform)
            filesRecord[platform] = files;
        const webFiles = filesRecord.web ?? [];
        const mobileFiles = filesRecord.mobile ?? [];
        const demanded = resolveTargets(ledger, flow);
        const covered = (hits.get(flow.id) ?? []).map((h) => ({
            platform: h.platform,
            dimensions: {},
        }));
        const uniqueCovered = [];
        const seen = new Set();
        for (const cell of covered) {
            const key = cellKey(cell);
            if (seen.has(key))
                continue;
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
export function summarizeCoverage(coverage) {
    const summary = {
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
export function collectIncompleteCoreIds(ledger, coverage, coreAreaIds) {
    const incomplete = [];
    for (const area of ledger.areas) {
        if (!coreAreaIds.includes(area.id))
            continue;
        const walk = (flows) => {
            for (const flow of flows) {
                if (flow.manual || flow.status === 'draft') {
                    if (flow.children?.length)
                        walk(flow.children);
                    continue;
                }
                const row = coverage.get(flow.id);
                if (row && row.status !== 'automated')
                    incomplete.push(flow.id);
                if (flow.children?.length)
                    walk(flow.children);
            }
        };
        for (const group of area.groups)
            walk(group.flows);
    }
    return uniqueSorted(incomplete);
}
export { collectWebE2eFlowFileMap };
//# sourceMappingURL=coverage.js.map