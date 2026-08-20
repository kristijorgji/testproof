import fs from 'node:fs';
import path from 'node:path';

import { createJiti } from 'jiti';

import { type TestproofConfig } from '@testproof/core';

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
    const jiti = createJiti(import.meta.url);
    const mod = (await jiti.import(file)) as { default?: TestproofConfig } & TestproofConfig;
    return mod.default ?? mod;
}
