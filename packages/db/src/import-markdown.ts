import fs from 'node:fs';

import { createDb } from './index.js';
import { runResults, runs, sessions } from './schema.js';

function parseRows(markdown: string): Array<{ id: string; flow?: string; status: string }> {
    const rows: Array<{ id: string; flow?: string; status: string }> = [];
    for (const line of markdown.split('\n')) {
        const match = line.match(/^\|\s*([A-Z]+)-(\d+)\s*\|\s*`?(FLOW-[A-Z0-9-]*)?`?\s*\|/);
        if (!match) continue;
        const id = `${match[1]}-${match[2]}`;
        const flow = match[3] || undefined;
        const status = /Pass/.test(line) ? 'pass' : /Partial/.test(line) ? 'blocked' : /Bug/.test(line) ? 'fail' : 'skip';
        rows.push({ id, flow, status });
    }
    return rows;
}

const file = process.argv[process.argv.indexOf('--file') + 1];
const projectId = process.argv[process.argv.indexOf('--project') + 1];
if (!file || !projectId || file.startsWith('--') || projectId.startsWith('--')) {
    throw new Error('Usage: node dist/import-markdown.js --project <uuid> --file <table.md>');
}

const markdown = fs.readFileSync(file, 'utf8');
const rows = parseRows(markdown);
const db = createDb();
const [run] = await db
    .insert(runs)
    .values({ projectId, source: 'manual', status: 'imported', metadata: { importer: 'markdown-table' } })
    .returning();
if (!run) throw new Error('failed to insert run');
await db.insert(sessions).values({
    projectId,
    title: 'Imported markdown session',
    notes: `${rows.length} rows`,
    runId: run.id,
});
if (rows.length) {
    await db.insert(runResults).values(
        rows.map((row) => ({
            runId: run.id,
            flowId: row.flow ?? null,
            platform: 'web',
            status: row.status,
            notes: row.id,
        })),
    );
}
console.log(`Imported ${rows.length} rows into run ${run.id}`);
process.exit(0);
