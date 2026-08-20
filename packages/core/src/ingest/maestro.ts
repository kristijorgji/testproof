import { collectMaestroFlowInventory } from '../scan/maestro.js';
import type { RunResult } from '../schema.js';

export interface MaestroRunFile {
    path: string;
    status: RunResult['status'];
    durationMs?: number;
    errorText?: string;
}

export function parseMaestroResults(flowsDir: string, runs: MaestroRunFile[], platform = 'mobile'): RunResult[] {
    const inventory = collectMaestroFlowInventory(flowsDir);
    const byPath = new Map(inventory.map((row) => [row.relativePath, row]));
    const results: RunResult[] = [];

    for (const run of runs) {
        const normalized = run.path.replace(/^\.?\//, '');
        const row =
            byPath.get(normalized) ??
            inventory.find((item) => normalized.endsWith(item.relativePath) || item.relativePath.endsWith(normalized));
        const flowIds = (row?.tags ?? []).filter((t) => t.startsWith('FLOW-'));
        const entry = {
            platform,
            status: run.status,
            durationMs: run.durationMs,
            errorText: run.errorText,
        };
        if (flowIds.length === 0) results.push({ flowId: null, ...entry });
        else for (const flowId of flowIds) results.push({ flowId, ...entry });
    }
    return results;
}
