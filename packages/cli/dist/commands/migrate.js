import fs from 'node:fs';
import path from 'node:path';
import { migrateLedgerSource } from '@testproof/core';
export function migrateCommand(config, cwd) {
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
//# sourceMappingURL=migrate.js.map