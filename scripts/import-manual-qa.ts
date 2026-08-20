#!/usr/bin/env npx tsx
/**
 * One-off importer: parse a Prona365-style manual-qa.md into sessions + run_results.
 * Usage: DATABASE_URL=... tsx scripts/import-manual-qa.ts --project <uuid> --file path/to/manual-qa.md
 */
import fs from 'node:fs';

import { runResults, runs, sessions } from '@testproof/db';
import { createDb } from '@testproof/db';

function parseRows(markdown: string): Array<{ id: string; flow?: string; status: string; notes?: string }> {
    const rows: Array<{ id: string; flow?: string; status: string; notes?: string }> = [];
    for (const line of markdown.split('\n')) {
        const match = line.match(/^\|\s*(WQA|MQA)-(\d+)\s*\|\s*`?(FLOW-[A-Z0-9-]*)?`?\s*\|/);
        if (!match) continue;
        const id = `${match[1]}-${match[2]}`;
        const flow = match[3] || undefined;
        const status = /Pass/.test(line) ? 'pass' : /Partial/.test(line) ? 'blocked' : /Bug/.test(line) ? 'fail' : 'skip';
        rows.push({ id, flow, status });
    }
    return rows;
}

async function main(): Promise<void> {
    const file = process.argv[process.argv.indexOf('--file') + 1];
    const projectId = process.argv[process.argv.indexOf('--project') + 1];
    if (!file || !projectId || file.startsWith('--') || projectId.startsWith('--')) {
        throw new Error('Usage: tsx scripts/import-manual-qa.ts --project <uuid> --file <manual-qa.md>');
    }
    const markdown = fs.readFileSync(file, 'utf8');
    const rows = parseRows(markdown);
    const db = createDb();
    const [run] = await db
        .insert(runs)
        .values({ projectId, source: 'manual', status: 'imported', metadata: { importer: 'manual-qa.md' } })
        .returning();
    if (!run) throw new Error('failed to insert run');
    await db.insert(sessions).values({
        projectId,
        title: 'Imported from manual-qa.md',
        notes: `${rows.length} rows`,
        runId: run.id,
    });
    if (rows.length) {
        await db.insert(runResults).values(
            rows.map((row) => ({
                runId: run.id,
                flowId: row.flow ?? null,
                platform: row.id.startsWith('MQA') ? 'mobile' : 'web',
                status: row.status,
                notes: row.id,
            })),
        );
    }
    console.log(`Imported ${rows.length} rows into run ${run.id}`);
}

main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});
