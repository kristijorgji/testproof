import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { generateCommand } from '../src/commands/generate.js';
import { initCommand } from '../src/commands/init.js';
import { validateCommand } from '../src/commands/validate.js';
import { loadConfig } from '../src/load-config.js';

const dirs: string[] = [];

afterEach(() => {
    for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

describe('cli commands', () => {
    it('init + validate + generate on a starter repo', async () => {
        const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'testproof-cli-'));
        dirs.push(cwd);
        initCommand(cwd);
        expect(fs.existsSync(path.join(cwd, 'testproof.config.ts'))).toBe(true);
        const config = await loadConfig(cwd);
        expect(validateCommand(config, cwd)).toBe(0);
        expect(generateCommand(config, cwd)).toBe(0);
        expect(fs.existsSync(path.join(cwd, 'docs/testing/flows-coverage.md'))).toBe(true);
        expect(generateCommand(config, cwd, true)).toBe(0);
    });
});
