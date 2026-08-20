import { ledgerPlatforms, platformLeaves, targetDimensions, targetPlatformId } from './platforms.js';
import type { CoverageCell, Flow, Ledger } from './schema.js';

function cartesian(entries: [string, string[]][]): Record<string, string>[] {
    if (entries.length === 0) return [{}];
    const [head, ...tail] = entries;
    if (!head) return [{}];
    const [key, values] = head;
    const rest = cartesian(tail);
    const out: Record<string, string>[] = [];
    for (const value of values) {
        for (const row of rest) {
            out.push({ ...row, [key]: value });
        }
    }
    return out;
}

export function resolveTargets(ledger: Ledger, flow: Flow): CoverageCell[] {
    const platforms = ledgerPlatforms(ledger);
    const targets = flow.targets ?? [];
    const cells: CoverageCell[] = [];
    const seen = new Set<string>();

    for (const target of targets) {
        const platformId = targetPlatformId(target);
        const leaves = platformLeaves(platforms, platformId);
        const dims = targetDimensions(target);
        const combos = dims ? cartesian(Object.entries(dims)) : [{}];
        for (const leaf of leaves) {
            for (const dimensions of combos) {
                const cell: CoverageCell = { platform: leaf, dimensions };
                const key = cellKey(cell);
                if (seen.has(key)) continue;
                seen.add(key);
                cells.push(cell);
            }
        }
    }
    return cells;
}

export function cellKey(cell: CoverageCell): string {
    const dim = Object.entries(cell.dimensions)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join(',');
    return dim ? `${cell.platform}|${dim}` : cell.platform;
}

export function cellsMatch(demanded: CoverageCell, covered: CoverageCell): boolean {
    if (demanded.platform !== covered.platform && !covered.platform.startsWith(`${demanded.platform}.`) && !demanded.platform.startsWith(`${covered.platform}.`)) {
        return false;
    }
    const demandedDims = Object.keys(demanded.dimensions);
    if (demandedDims.length === 0) return true;
    if (Object.keys(covered.dimensions).length === 0) return true;
    return demandedDims.every((key) => demanded.dimensions[key] === covered.dimensions[key]);
}
