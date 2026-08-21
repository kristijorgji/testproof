import type { CoverageCell } from '@testproof/core';
import { coverageSnapshots, flowCoverage } from '@testproof/db';
import { desc, eq } from 'drizzle-orm';

import { getDb } from './db';

export type CoverageRow = {
    status: 'automated' | 'partial' | 'todo' | 'manual';
    demanded: CoverageCell[];
    covered: CoverageCell[];
};

export async function getLatestCoverage(projectId: string): Promise<Record<string, CoverageRow>> {
    const coverage: Record<string, CoverageRow> = {};
    try {
        const [snapshot] = await getDb()
            .select()
            .from(coverageSnapshots)
            .where(eq(coverageSnapshots.projectId, projectId))
            .orderBy(desc(coverageSnapshots.createdAt))
            .limit(1);
        if (!snapshot) return coverage;
        const rows = await getDb().select().from(flowCoverage).where(eq(flowCoverage.snapshotId, snapshot.id));
        for (const row of rows) {
            coverage[row.flowId] = {
                status: row.status as CoverageRow['status'],
                demanded: (row.demandedCells as CoverageCell[]) ?? [],
                covered: (row.coveredCells as CoverageCell[]) ?? [],
            };
        }
    } catch {
        /* empty */
    }
    return coverage;
}
