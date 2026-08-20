import fs from 'node:fs';
import path from 'node:path';

import { type TestproofConfig, validateLedger } from '@testproof/core';

export function validateCommand(config: TestproofConfig, cwd: string, strict = false): number {
    const yamlSource = fs.readFileSync(path.resolve(cwd, config.ledger), 'utf8');
    const scanners = config.platforms.map((p) => ({ ...p, dir: path.resolve(cwd, p.dir) }));
    const result = validateLedger({ yamlSource, scanners, coreAreaIds: config.coreAreaIds });

    if (result.missingFromLedger.length > 0) {
        console.error('FLOW ids used in specs but missing from the ledger:');
        for (const id of result.missingFromLedger) console.error(`  - ${id}`);
        return 1;
    }
    if (result.incompleteCoreIds.length > 0) {
        const line = 'Core-area flows not fully covered:';
        if (strict) {
            console.error(line);
            for (const id of result.incompleteCoreIds) console.error(`  - ${id}`);
            return 1;
        }
        console.warn(line);
        for (const id of result.incompleteCoreIds) console.warn(`  - ${id}`);
    }
    console.log(
        `testproof validate: ok (maestro=${result.maestroIds.length} web=${result.webIds.length} ledger=${result.ledgerIds.length})`,
    );
    return 0;
}
