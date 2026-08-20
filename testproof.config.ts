import { defineConfig } from '@testproof/core';

export default defineConfig({
    ledger: 'examples/demo/flows.yaml',
    platforms: [
        { name: 'web', dir: 'examples/demo/web-specs', extractor: 'regex-tag' },
        { name: 'mobile', dir: 'examples/demo/mobile-flows', extractor: 'maestro-tags' },
    ],
    coreAreaIds: ['AUTH'],
    output: {
        markdown: 'examples/demo/flows-coverage.md',
        html: 'examples/demo/.generated/flows.html',
    },
    server: {
        url: process.env.TESTPROOF_URL,
        token: process.env.TESTPROOF_TOKEN,
        projectId: process.env.TESTPROOF_PROJECT,
    },
});
