import fs from 'node:fs';
import path from 'node:path';

import {
    coveragePushBodySchema,
    deriveCoverage,
    parseLedger,
    summarizeCoverage,
    type TestproofConfig,
} from '@testproof/core';

export async function pushCommand(config: TestproofConfig, cwd: string): Promise<number> {
    const url = config.server?.url;
    const token = config.server?.token;
    const projectId = config.server?.projectId;
    if (!url) {
        console.log('testproof push: server.url unset — skipping (offline mode)');
        return 0;
    }
    if (!token || !projectId) {
        console.error('testproof push: TESTPROOF_TOKEN and TESTPROOF_PROJECT are required when server.url is set');
        return 1;
    }

    const yamlSource = fs.readFileSync(path.resolve(cwd, config.ledger), 'utf8');
    const ledger = parseLedger(yamlSource);
    const scanners = config.platforms.map((p) => ({ ...p, dir: path.resolve(cwd, p.dir) }));
    const coverage = deriveCoverage(ledger, { scanners });
    const summary = summarizeCoverage(coverage);
    const body = coveragePushBodySchema.parse({
        projectId,
        commitSha: process.env.GITHUB_SHA ?? 'local',
        branch: process.env.GITHUB_REF_NAME ?? 'local',
        summary,
        flows: [...coverage.values()].map((row) => ({
            id: row.id,
            status: row.status,
            demanded: row.demanded,
            covered: row.covered,
            platforms: row.filesByPlatform,
        })),
    });

    const response = await fetch(new URL('/api/v1/coverage', url), {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        console.error(`testproof push: ${response.status} ${await response.text()}`);
        return 1;
    }
    console.log(`testproof push: ok (${JSON.stringify(await response.json())})`);
    return 0;
}
