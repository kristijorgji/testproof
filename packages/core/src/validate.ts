import type { PlatformScannerConfig } from './config.js';
import { collectIncompleteCoreIds, deriveCoverage } from './coverage.js';
import { flattenFlowIds, parseLedger } from './parse.js';
import { collectMaestroFlowInventory } from './scan/maestro.js';
import { collectFlowFileMap } from './scan/web.js';

export interface ValidateResult {
    /** Flow ids found in source, keyed by scanner name. */
    idsByScanner: Record<string, string[]>;
    ledgerIds: string[];
    missingFromLedger: string[];
    incompleteCoreIds: string[];
}

function uniqueSorted(ids: Iterable<string>): string[] {
    return [...new Set(ids)].sort();
}

export function validateLedger(options: {
    yamlSource: string;
    scanners: PlatformScannerConfig[];
    coreAreaIds?: string[];
}): ValidateResult {
    const ledger = parseLedger(options.yamlSource);
    const ledgerIds = uniqueSorted(flattenFlowIds(ledger));
    const ledgerSet = new Set(ledgerIds);
    const idsByScanner: Record<string, string[]> = {};

    for (const scanner of options.scanners) {
        const found: string[] = [];
        if (scanner.extractor === 'maestro-tags') {
            for (const row of collectMaestroFlowInventory(scanner.dir)) {
                for (const tag of row.tags) {
                    if (tag.startsWith('FLOW-')) found.push(tag);
                }
            }
        } else {
            found.push(...collectFlowFileMap(scanner.dir, scanner.ignore).keys());
        }
        idsByScanner[scanner.name] = uniqueSorted([...(idsByScanner[scanner.name] ?? []), ...found]);
    }

    const codeIds = uniqueSorted(Object.values(idsByScanner).flat());
    const missingFromLedger = codeIds.filter((id) => !ledgerSet.has(id));
    const coverage = deriveCoverage(ledger, { scanners: options.scanners });
    const incompleteCoreIds = collectIncompleteCoreIds(ledger, coverage, options.coreAreaIds ?? []);

    return { idsByScanner, ledgerIds, missingFromLedger, incompleteCoreIds };
}
