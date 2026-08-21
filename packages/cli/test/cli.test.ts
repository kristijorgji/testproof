import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { generateCommand } from '../src/commands/generate.js';
import { initCommand } from '../src/commands/init.js';
import { ledgerPullCommand, ledgerPushCommand } from '../src/commands/ledger.js';
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

    it('ledger pull writes the remote YAML and push sends it back', async () => {
        const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'testproof-cli-'));
        dirs.push(cwd);
        initCommand(cwd);
        const remoteYaml = fs.readFileSync(path.join(cwd, 'docs/testing/flows.yaml'), 'utf8');
        const config = await loadConfig(cwd);
        config.server = { url: 'http://ledger.test', token: 'tok', projectId: 'proj' };

        const fetchMock = vi.fn(async (input: string | URL, init?: RequestInit) => {
            const url = String(input);
            if (init?.method === 'PUT') {
                const body = JSON.parse(String(init.body)) as { yaml: string; baseRevision: number };
                expect(body.yaml).toContain('FLOW-HOME-OPENS');
                expect(body.baseRevision).toBe(3);
                return new Response(JSON.stringify({ revision: 4 }), { status: 200 });
            }
            expect(url).toContain('/api/v1/ledger');
            return new Response(JSON.stringify({ yaml: remoteYaml, revision: 3, storage: 'db' }), { status: 200 });
        });
        vi.stubGlobal('fetch', fetchMock);

        fs.writeFileSync(path.join(cwd, 'docs/testing/flows.yaml'), 'stale');
        expect(await ledgerPullCommand(config, cwd, true)).toBe(0);
        expect(fs.readFileSync(path.join(cwd, 'docs/testing/flows.yaml'), 'utf8')).toBe(remoteYaml);
        expect(await ledgerPushCommand(config, cwd)).toBe(0);
        expect(fetchMock).toHaveBeenCalled();
        vi.unstubAllGlobals();
    });
});
