import type { PlatformScannerConfig } from './config.js';
import { collectIncompleteCoreIds, deriveCoverage } from './coverage.js';
import { flattenFlowIds, parseLedger } from './parse.js';
import { collectMaestroFlowInventory } from './scan/maestro.js';
import { collectWebE2eFlowFileMap } from './scan/web.js';

export interface ValidateResult {
    maestroIds: string[];
    webIds: string[];
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
    const maestroIds: string[] = [];
    const webIds: string[] = [];

    for (const scanner of options.scanners) {
        if (scanner.extractor === 'maestro-tags') {
            for (const row of collectMaestroFlowInventory(scanner.dir)) {
                for (const tag of row.tags) {
                    if (tag.startsWith('FLOW-')) maestroIds.push(tag);
                }
            }
        } else {
            webIds.push(...collectWebE2eFlowFileMap(scanner.dir, scanner.ignore).keys());
        }
    }

    const codeIds = uniqueSorted([...maestroIds, ...webIds]);
    const missingFromLedger = codeIds.filter((id) => !ledgerSet.has(id));
    const coverage = deriveCoverage(ledger, { scanners: options.scanners });
    const incompleteCoreIds = collectIncompleteCoreIds(ledger, coverage, options.coreAreaIds ?? []);

    return {
        maestroIds: uniqueSorted(maestroIds),
        webIds: uniqueSorted(webIds),
        ledgerIds,
        missingFromLedger,
        incompleteCoreIds,
    };
}
