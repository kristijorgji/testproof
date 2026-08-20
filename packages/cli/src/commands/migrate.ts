import fs from 'node:fs';
import path from 'node:path';

import { migrateLedgerSource, type TestproofConfig } from '@testproof/core';

export function migrateCommand(config: TestproofConfig, cwd: string): number {
    const ledgerPath = path.resolve(cwd, config.ledger);
    const source = fs.readFileSync(ledgerPath, 'utf8');
    const next = migrateLedgerSource(source);
    if (next === source) {
        console.log('testproof migrate: already v2');
        return 0;
    }
    fs.writeFileSync(ledgerPath, next);
    console.log(`testproof migrate: wrote ${path.relative(cwd, ledgerPath)}`);
    return 0;
}
