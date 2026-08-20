import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { type TestproofConfig } from '@testproof/core';
import { createJiti } from 'jiti';

const require = createRequire(import.meta.url);

function resolveCore(): string {
    try {
        return require.resolve('@testproof/core');
    } catch {
        return createRequire(path.join(process.cwd(), 'package.json')).resolve('@testproof/core');
    }
}

const NAMES = ['testproof.config.ts', 'testproof.config.js', 'testproof.config.mjs'];

export function findConfigPath(cwd = process.cwd()): string | undefined {
    for (const name of NAMES) {
        const full = path.join(cwd, name);
        if (fs.existsSync(full)) return full;
    }
    return undefined;
}

export async function loadConfig(cwd = process.cwd(), explicit?: string): Promise<TestproofConfig> {
    const file = explicit ? path.resolve(cwd, explicit) : findConfigPath(cwd);
    if (!file) {
        throw new Error('No testproof.config.ts found. Run `testproof init` first.');
    }
    const jiti = createJiti(import.meta.url, {
        alias: {
            '@testproof/core': resolveCore(),
        },
    });
    const mod: unknown = await jiti.import(file);
    if (typeof mod === 'object' && mod !== null && 'default' in mod) {
        return (mod as { default: TestproofConfig }).default;
    }
    return mod as TestproofConfig;
}
