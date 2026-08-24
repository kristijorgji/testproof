import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { deriveCoverage } from '../src/coverage.js';
import { parseLedger } from '../src/parse.js';
import { platformCovers } from '../src/platforms.js';
import { renderFlowsMarkdown } from '../src/render/markdown.js';
import { resolveDisplayPlatformLines } from '../src/render/platform-lines.js';

const tempDirs: string[] = [];

afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});

function makeTempDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'platform-lines-'));
    tempDirs.push(dir);
    return dir;
}

const platformTree = `
platforms:
  - id: web
    title: Web
    children:
      - id: web.chrome
        title: Chrome
      - id: web.safari
        title: Safari
  - id: mobile
    title: Mobile
    children:
      - id: mobile.ios
        title: iOS
      - id: mobile.android
        title: Android
`;

describe('resolveDisplayPlatformLines', () => {
    it('shows parent platforms when parent scanners satisfy demand', () => {
        const ledger = parseLedger(`
version: 2
${platformTree}
areas:
  - id: AUTH
    title: AUTH
    groups:
      - title: Login
        flows:
          - id: FLOW-A
            title: Login
            targets: [web, mobile]
`);
        const root = makeTempDir();
        const maestro = path.join(root, 'flows');
        const specs = path.join(root, 'specs');
        fs.mkdirSync(maestro, { recursive: true });
        fs.mkdirSync(specs, { recursive: true });
        fs.writeFileSync(path.join(maestro, 'login.yaml'), `appId: x\ntags:\n  - FLOW-A\n---\n- launchApp\n`);
        fs.writeFileSync(path.join(specs, 'login.spec.ts'), `test('login', { tag: ['@FLOW-A'] }, async () => {});\n`);
        const coverage = deriveCoverage(ledger, {
            scanners: [
                { name: 'web', dir: specs, extractor: 'regex-tag', linkPrefix: 'W' },
                { name: 'mobile', dir: maestro, extractor: 'maestro-tags', linkPrefix: 'M' },
            ],
        });
        const row = coverage.get('FLOW-A');
        expect(row).toBeDefined();
        if (!row) throw new Error('expected coverage row');
        const flow = ledger.areas[0]?.groups[0]?.flows[0];
        expect(flow).toBeDefined();
        if (!flow) throw new Error('expected flow');
        const lines = resolveDisplayPlatformLines(flow, row, ledger);
        expect(lines.map((line) => line.platform)).toEqual(['mobile', 'web']);
        expect(lines.every((line) => line.covered)).toBe(true);
        expect(lines.flatMap((line) => line.files).sort()).toEqual(['M/login.yaml', 'W/login.spec.ts']);
    });

    it('shows only explicit leaf when targeted', () => {
        const ledger = parseLedger(`
version: 2
${platformTree}
areas:
  - id: AUTH
    title: AUTH
    groups:
      - title: Login
        flows:
          - id: FLOW-A
            title: Android only
            targets: [mobile.android]
`);
        const coverage = deriveCoverage(ledger, { scanners: [] });
        const row = coverage.get('FLOW-A');
        expect(row).toBeDefined();
        if (!row) throw new Error('expected coverage row');
        const flow = ledger.areas[0]?.groups[0]?.flows[0];
        expect(flow).toBeDefined();
        if (!flow) throw new Error('expected flow');
        const lines = resolveDisplayPlatformLines(flow, row, ledger);
        expect(lines).toEqual([{ platform: 'mobile.android', dimensions: {}, files: [], covered: false }]);
    });

    it('expands to leaves when coverage is partial', () => {
        const ledger = parseLedger(`
version: 2
${platformTree}
areas:
  - id: AUTH
    title: AUTH
    groups:
      - title: Login
        flows:
          - id: FLOW-A
            title: Mobile partial
            targets: [mobile]
`);
        const root = makeTempDir();
        const maestro = path.join(root, 'flows');
        fs.mkdirSync(maestro, { recursive: true });
        fs.writeFileSync(
            path.join(maestro, 'android.yaml'),
            `appId: x\ntags:\n  - platform:mobile.android\n  - FLOW-A\n---\n- launchApp\n`,
        );
        const coverage = deriveCoverage(ledger, {
            scanners: [{ name: 'mobile', dir: maestro, extractor: 'maestro-tags', linkPrefix: 'M' }],
        });
        const row = coverage.get('FLOW-A');
        expect(row?.status).toBe('partial');
        if (!row) throw new Error('expected coverage row');
        const flow = ledger.areas[0]?.groups[0]?.flows[0];
        expect(flow).toBeDefined();
        if (!flow) throw new Error('expected flow');
        const lines = resolveDisplayPlatformLines(flow, row, ledger);
        expect(lines.map((line) => [line.platform, line.covered])).toEqual([
            ['mobile.android', true],
            ['mobile.ios', false],
        ]);
    });

    it('rolls up child scanner files to parent display line', () => {
        expect(platformCovers('web.chrome', 'web')).toBe(true);
        const ledger = parseLedger(`
version: 2
${platformTree}
areas:
  - id: AUTH
    title: AUTH
    groups:
      - title: Login
        flows:
          - id: FLOW-A
            title: Web
            targets: [web]
`);
        const root = makeTempDir();
        const specs = path.join(root, 'specs');
        fs.mkdirSync(specs, { recursive: true });
        fs.writeFileSync(path.join(specs, 'safari.spec.ts'), `/** @FLOW-A */\ntest('x', async () => {});\n`);
        const coverage = deriveCoverage(ledger, {
            scanners: [{ name: 'web', dir: specs, extractor: 'regex-tag', linkPrefix: 'W' }],
        });
        const row = coverage.get('FLOW-A');
        expect(row).toBeDefined();
        if (!row) throw new Error('expected coverage row');
        const flow = ledger.areas[0]?.groups[0]?.flows[0];
        expect(flow).toBeDefined();
        if (!flow) throw new Error('expected flow');
        const lines = resolveDisplayPlatformLines(flow, row, ledger);
        expect(lines.map((line) => line.platform)).toEqual(['web']);
        expect(lines[0]?.files).toEqual(['W/safari.spec.ts']);
        expect(lines[0]?.covered).toBe(true);
    });
});

describe('renderFlowsMarkdown display lines', () => {
    it('does not emit misleading leaf todo lines for parent targets', () => {
        const ledger = parseLedger(`
version: 2
${platformTree}
areas:
  - id: AUTH
    title: AUTH
    groups:
      - title: Login
        flows:
          - id: FLOW-A
            title: Login
            targets: [web, mobile]
`);
        const root = makeTempDir();
        const maestro = path.join(root, 'flows');
        const specs = path.join(root, 'specs');
        fs.mkdirSync(maestro, { recursive: true });
        fs.mkdirSync(specs, { recursive: true });
        fs.writeFileSync(path.join(maestro, 'login.yaml'), `appId: x\ntags:\n  - FLOW-A\n---\n- launchApp\n`);
        fs.writeFileSync(path.join(specs, 'login.spec.ts'), `test('login', { tag: ['@FLOW-A'] }, async () => {});\n`);
        const coverage = deriveCoverage(ledger, {
            scanners: [
                { name: 'web', dir: specs, extractor: 'regex-tag', linkPrefix: 'W' },
                { name: 'mobile', dir: maestro, extractor: 'maestro-tags', linkPrefix: 'M' },
            ],
        });
        const md = renderFlowsMarkdown(ledger, coverage);
        expect(md).toContain('**web:** [x]');
        expect(md).toContain('**mobile:** [x]');
        expect(md).not.toContain('**web.chrome:**');
        expect(md).not.toContain('**mobile.android:** [ ]');
    });
});
