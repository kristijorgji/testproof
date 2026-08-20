import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { deriveCoverage } from '../src/coverage.js';
import { parseLedger } from '../src/parse.js';
import { renderFlowsMarkdown } from '../src/render/markdown.js';

const dir = dirname(fileURLToPath(import.meta.url));

describe('renderFlowsMarkdown', () => {
    it('renders the sample fixture ledger without crashing', () => {
        const yaml = readFileSync(join(dir, 'fixtures/flows.yaml'), 'utf8');
        const ledger = parseLedger(yaml);
        const coverage = deriveCoverage(ledger, { scanners: [] });
        const md = renderFlowsMarkdown(ledger, coverage);
        expect(md).toContain('# Test Flows & Coverage');
        expect(md).toContain('FLOW-AUTH-LOGIN-INVALID');
        expect(md).toContain('## Common for web and mobile');
    });
});
