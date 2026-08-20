#!/usr/bin/env node
import { Command } from 'commander';

import { generateCommand, reportCommand } from './commands/generate.js';
import { initCommand } from './commands/init.js';
import { migrateCommand } from './commands/migrate.js';
import { pushCommand } from './commands/push.js';
import { validateCommand } from './commands/validate.js';
import { loadConfig } from './load-config.js';

async function main(): Promise<void> {
    const program = new Command('testproof').description('Git-native test case management').version('0.1.0');

    program.command('init').description('Write a starter config and empty ledger').action(() => {
        initCommand(process.cwd());
    });

    program
        .command('validate')
        .option('--strict', 'Promote core-area coverage warnings to failures')
        .option('--config <path>', 'Path to testproof.config.ts')
        .action(async (opts: { strict?: boolean; config?: string }) => {
            const config = await loadConfig(process.cwd(), opts.config);
            process.exitCode = validateCommand(config, process.cwd(), Boolean(opts.strict));
        });

    program
        .command('generate')
        .option('--check', 'Exit 1 if generated markdown would drift')
        .option('--config <path>', 'Path to testproof.config.ts')
        .action(async (opts: { check?: boolean; config?: string }) => {
            const config = await loadConfig(process.cwd(), opts.config);
            process.exitCode = generateCommand(config, process.cwd(), Boolean(opts.check));
        });

    program
        .command('report')
        .option('--open', 'Open the HTML report')
        .option('--config <path>', 'Path to testproof.config.ts')
        .action(async (opts: { open?: boolean; config?: string }) => {
            const config = await loadConfig(process.cwd(), opts.config);
            process.exitCode = await reportCommand(config, process.cwd(), Boolean(opts.open));
        });

    program
        .command('push')
        .option('--config <path>', 'Path to testproof.config.ts')
        .action(async (opts: { config?: string }) => {
            const config = await loadConfig(process.cwd(), opts.config);
            process.exitCode = await pushCommand(config, process.cwd());
        });

    program
        .command('migrate')
        .description('Rewrite a v1 ledger to v2 in place')
        .option('--config <path>', 'Path to testproof.config.ts')
        .action(async (opts: { config?: string }) => {
            const config = await loadConfig(process.cwd(), opts.config);
            process.exitCode = migrateCommand(config, process.cwd());
        });

    await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
