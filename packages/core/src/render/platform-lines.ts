import type { FlowCoverage } from '../coverage.js';
import { ledgerPlatforms, platformCovers, platformLeaves, targetDimensions, targetPlatformId } from '../platforms.js';
import type { CoverageCell, Flow, FlowTarget, Ledger } from '../schema.js';
import { cellKey, cellsMatch, resolveTargets } from '../targets.js';

export interface DisplayPlatformLine {
    platform: string;
    dimensions: Record<string, string>;
    files: string[];
    covered: boolean;
}

function uniqueSorted(values: Iterable<string>): string[] {
    return [...new Set(values)].sort();
}

function filesForPlatform(filesByPlatform: Record<string, string[]>, platform: string): string[] {
    const out: string[] = [];
    for (const [key, files] of Object.entries(filesByPlatform)) {
        if (platformCovers(key, platform) || platformCovers(platform, key)) {
            out.push(...files);
        }
    }
    return uniqueSorted(out);
}

function cellCovered(cell: CoverageCell, covered: CoverageCell[]): boolean {
    return covered.some(
        (hit) =>
            cellsMatch(cell, hit) ||
            (platformCovers(hit.platform, cell.platform) && Object.keys(cell.dimensions).length === 0),
    );
}

function targetHasDimensions(target: FlowTarget): boolean {
    const dims = targetDimensions(target);
    return Boolean(dims && Object.keys(dims).length > 0);
}

function displayCellsForTarget(target: FlowTarget, ledger: Ledger, status: FlowCoverage['status']): CoverageCell[] {
    if (targetHasDimensions(target)) {
        return resolveTargets(ledger, { id: 'display', title: 'display', targets: [target] });
    }

    const platformId = targetPlatformId(target);
    const leaves = platformLeaves(ledgerPlatforms(ledger), platformId);

    if (status === 'partial' && leaves.length > 1) {
        return leaves.map((leaf) => ({ platform: leaf, dimensions: {} }));
    }

    return [{ platform: platformId, dimensions: {} }];
}

function lineKey(line: DisplayPlatformLine): string {
    return cellKey({ platform: line.platform, dimensions: line.dimensions });
}

function lineImpliedByDisplay(key: string, displayPlatforms: string[]): boolean {
    for (const displayPlatform of displayPlatforms) {
        if (platformCovers(key, displayPlatform) || platformCovers(displayPlatform, key)) return true;
    }
    return false;
}

export function resolveDisplayPlatformLines(flow: Flow, cov: FlowCoverage, ledger: Ledger): DisplayPlatformLine[] {
    const targets = flow.targets ?? [];
    const lines: DisplayPlatformLine[] = [];
    const seen = new Set<string>();

    for (const target of targets) {
        for (const cell of displayCellsForTarget(target, ledger, cov.status)) {
            const key = cellKey(cell);
            if (seen.has(key)) continue;
            seen.add(key);
            const files = filesForPlatform(cov.filesByPlatform, cell.platform);
            const covered = cellCovered(cell, cov.covered) || files.length > 0;
            lines.push({ platform: cell.platform, dimensions: cell.dimensions, files, covered });
        }
    }

    const displayPlatforms = lines.map((line) => line.platform);
    for (const key of Object.keys(cov.filesByPlatform).sort()) {
        const implied =
            lineImpliedByDisplay(key, displayPlatforms) ||
            lines.some((line) => platformCovers(key, line.platform) || platformCovers(line.platform, key));
        if (implied) continue;
        const files = cov.filesByPlatform[key] ?? [];
        if (files.length === 0) continue;
        const line: DisplayPlatformLine = {
            platform: key,
            dimensions: {},
            files: uniqueSorted(files),
            covered: true,
        };
        const dedupe = lineKey(line);
        if (seen.has(dedupe)) continue;
        seen.add(dedupe);
        lines.push(line);
    }

    return lines.sort((a, b) => a.platform.localeCompare(b.platform));
}
