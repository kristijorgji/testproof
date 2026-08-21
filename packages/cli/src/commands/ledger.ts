import fs from 'node:fs';
import path from 'node:path';

import { ledgerPutBodySchema, parseLedger, type TestproofConfig } from '@testproof/core';

function requireServer(config: TestproofConfig): { url: string; token: string; projectId: string } | number {
    const url = config.server?.url;
    const token = config.server?.token;
    const projectId = config.server?.projectId;
    if (!url) {
        console.error('testproof ledger: server.url is required');
        return 1;
    }
    if (!token || !projectId) {
        console.error('testproof ledger: TESTPROOF_TOKEN and TESTPROOF_PROJECT are required');
        return 1;
    }
    return { url, token, projectId };
}

export async function ledgerPullCommand(config: TestproofConfig, cwd: string, force = false): Promise<number> {
    const server = requireServer(config);
    if (typeof server === 'number') return server;
    const dest = path.resolve(cwd, config.ledger);
    const response = await fetch(new URL('/api/v1/ledger', server.url), {
        headers: { authorization: `Bearer ${server.token}` },
    });
    if (!response.ok) {
        console.error(`testproof ledger pull: ${response.status} ${await response.text()}`);
        return 1;
    }
    const body = (await response.json()) as { yaml: string };
    parseLedger(body.yaml);
    if (fs.existsSync(dest) && !force) {
        const current = fs.readFileSync(dest, 'utf8');
        if (current !== body.yaml) {
            console.error(
                `testproof ledger pull: ${path.relative(cwd, dest)} has local changes; pass --force to overwrite`,
            );
            return 1;
        }
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, body.yaml);
    console.log(`testproof ledger pull: wrote ${path.relative(cwd, dest)}`);
    return 0;
}

export async function ledgerPushCommand(config: TestproofConfig, cwd: string, force = false): Promise<number> {
    const server = requireServer(config);
    if (typeof server === 'number') return server;
    const src = path.resolve(cwd, config.ledger);
    const yaml = fs.readFileSync(src, 'utf8');
    parseLedger(yaml);

    const current = await fetch(new URL('/api/v1/ledger', server.url), {
        headers: { authorization: `Bearer ${server.token}` },
    });
    if (!current.ok) {
        console.error(`testproof ledger push: ${current.status} ${await current.text()}`);
        return 1;
    }
    const remote = (await current.json()) as { yaml: string; revision: number };
    const put = async (baseRevision: number): Promise<Response> =>
        fetch(new URL('/api/v1/ledger', server.url), {
            method: 'PUT',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${server.token}`,
            },
            body: JSON.stringify(ledgerPutBodySchema.parse({ yaml, baseRevision, message: 'testproof ledger push' })),
        });
    let response = await put(remote.revision);
    if (response.status === 409 && force) {
        const latest = await fetch(new URL('/api/v1/ledger', server.url), {
            headers: { authorization: `Bearer ${server.token}` },
        });
        if (latest.ok) {
            const next = (await latest.json()) as { revision: number };
            response = await put(next.revision);
        }
    }
    if (response.status === 409) {
        console.error('testproof ledger push: remote ledger changed; pull or pass --force');
        return 1;
    }
    if (!response.ok) {
        console.error(`testproof ledger push: ${response.status} ${await response.text()}`);
        return 1;
    }
    console.log(`testproof ledger push: ok (${JSON.stringify(await response.json())})`);
    return 0;
}
