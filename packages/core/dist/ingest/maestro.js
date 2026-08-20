import { collectMaestroFlowInventory } from '../scan/maestro.js';
export function parseMaestroResults(flowsDir, runs, platform = 'mobile') {
    const inventory = collectMaestroFlowInventory(flowsDir);
    const byPath = new Map(inventory.map((row) => [row.relativePath, row]));
    const results = [];
    for (const run of runs) {
        const normalized = run.path.replace(/^\.?\//, '');
        const row = byPath.get(normalized) ??
            inventory.find((item) => normalized.endsWith(item.relativePath) || item.relativePath.endsWith(normalized));
        const flowIds = (row?.tags ?? []).filter((t) => t.startsWith('FLOW-'));
        const entry = {
            platform,
            status: run.status,
            durationMs: run.durationMs,
            errorText: run.errorText,
        };
        if (flowIds.length === 0)
            results.push({ flowId: null, ...entry });
        else
            for (const flowId of flowIds)
                results.push({ flowId, ...entry });
    }
    return results;
}
//# sourceMappingURL=maestro.js.map