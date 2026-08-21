import fs from 'node:fs';
import path from 'node:path';

const CONFIG = `import { defineConfig } from '@testproof/core';

export default defineConfig({
    ledger: 'docs/testing/flows.yaml',
    platforms: [
        { name: 'web', dir: 'apps/web-e2e/src/specs', extractor: 'regex-tag', ignore: ['__screenshots__'] },
        { name: 'mobile', dir: 'apps/mobile/.maestro/flows', extractor: 'maestro-tags' },
    ],
    coreAreaIds: ['AUTH', 'ALL', 'HOME', 'PROPERTIES'],
    output: {
        markdown: 'docs/testing/flows-coverage.md',
        html: 'docs/testing/.generated/flows.html',
    },
    server: {
        url: process.env.TESTPROOF_URL,
        token: process.env.TESTPROOF_TOKEN,
        projectId: process.env.TESTPROOF_PROJECT,
    },
});
`;

const LEDGER = `version: 2
platforms:
  - id: web
    title: Web
  - id: mobile
    title: Mobile
    children:
      - id: mobile.ios
        title: iOS
      - id: mobile.android
        title: Android
areas:
  - id: HOME
    title: HOME
    targets: [web, mobile]
    groups:
      - title: HOME
        flows:
          - id: FLOW-HOME-OPENS
            title: Home opens
`;

export function initCommand(cwd = process.cwd()): void {
    const configPath = path.join(cwd, 'testproof.config.ts');
    if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, CONFIG);
    const ledgerPath = path.join(cwd, 'docs/testing/flows.yaml');
    fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
    if (!fs.existsSync(ledgerPath)) fs.writeFileSync(ledgerPath, LEDGER);
    console.log(`Wrote ${path.relative(cwd, configPath)} and ${path.relative(cwd, ledgerPath)}`);
}
