import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { deriveCoverage } from '../src/coverage.js';
import { parseLedger } from '../src/parse.js';

const tempDirs: string[] = [];

afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});

function makeTempDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'derive-coverage-'));
    tempDirs.push(dir);
    return dir;
}

describe('deriveCoverage', () => {
    it('maps code tags to coverage rows', () => {
        const root = makeTempDir();
        const maestro = path.join(root, 'flows');
        const specs = path.join(root, 'specs');
        fs.mkdirSync(maestro, { recursive: true });
        fs.mkdirSync(specs, { recursive: true });
        fs.writeFileSync(path.join(maestro, 'home.yaml'), `appId: x\ntags:\n  - FLOW-HOME-OPENS\n---\n- launchApp\n`);
        fs.writeFileSync(
            path.join(specs, 'home.spec.ts'),
            `test('home', { tag: ['@FLOW-HOME-OPENS'] }, async () => {});\n`,
        );
        const ledger = parseLedger(`
version: 2
areas:
  - id: HOME
    title: HOME
    targets: [web, mobile]
    groups:
      - title: Home
        flows:
          - id: FLOW-HOME-OPENS
            title: Page opens
          - id: FLOW-HOME-SEARCH
            title: Search
  - id: MAINT
    title: Maint
    targets: [web]
    groups:
      - title: M
        flows:
          - id: FLOW-WEB-MAINT
            title: Maint
            manual: true
`);
        const coverage = deriveCoverage(ledger, {
            scanners: [
                { name: 'web', dir: specs, extractor: 'regex-tag', linkPrefix: 'W' },
                { name: 'mobile', dir: maestro, extractor: 'maestro-tags', linkPrefix: 'M' },
            ],
        });
        expect(coverage.get('FLOW-HOME-OPENS')?.status).toBe('automated');
        expect(coverage.get('FLOW-HOME-OPENS')?.filesByPlatform.web).toEqual(['W/home.spec.ts']);
        expect(coverage.get('FLOW-HOME-OPENS')?.filesByPlatform.mobile).toEqual(['M/home.yaml']);
        expect(coverage.get('FLOW-HOME-SEARCH')?.status).toBe('todo');
        expect(coverage.get('FLOW-WEB-MAINT')?.status).toBe('manual');
    });
});
