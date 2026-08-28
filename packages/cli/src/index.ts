#!/usr/bin/env node
import { Command } from 'commander';

import { generateCommand, reportCommand } from './commands/generate.js';
import { initCommand } from './commands/init.js';
import { ledgerPullCommand, ledgerPushCommand } from './commands/ledger.js';
import { pushCommand } from './commands/push.js';
import { validateCommand } from './commands/validate.js';
import { loadConfig } from './load-config.js';

async function main(): Promise<void> {
    const program = new Command('testproof').description('Git-native test case management').version('0.4.11');

    program
        .command('init')
        .description('Write a starter config and empty ledger')
        .action(() => {
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

    const ledger = program.command('ledger').description('Pull or push ledger YAML against a Testproof server');

    ledger
        .command('pull')
        .description('Download the server ledger into config.ledger')
        .option('--force', 'Overwrite local changes')
        .option('--config <path>', 'Path to testproof.config.ts')
        .action(async (opts: { force?: boolean; config?: string }) => {
            const config = await loadConfig(process.cwd(), opts.config);
            process.exitCode = await ledgerPullCommand(config, process.cwd(), Boolean(opts.force));
        });

    ledger
        .command('push')
        .description('Upload config.ledger to the server')
        .option('--force', 'Overwrite a stale remote revision')
        .option('--config <path>', 'Path to testproof.config.ts')
        .action(async (opts: { force?: boolean; config?: string }) => {
            const config = await loadConfig(process.cwd(), opts.config);
            process.exitCode = await ledgerPushCommand(config, process.cwd(), Boolean(opts.force));
        });

    await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
